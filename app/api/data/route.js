export const runtime = 'edge';

// Simple in-memory cache
let cachedData = null;
let cacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET() {
  try {
    // Return cached data if still valid
    if (cachedData && cacheTime && (Date.now() - cacheTime < CACHE_DURATION)) {
      return Response.json({
        ...cachedData,
        cached: true,
        cacheAge: Math.floor((Date.now() - cacheTime) / 1000) + ' seconds'
      });
    }

    // Call Claude API to read the Google Sheet
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4000,
        messages: [
          {
            role: "user",
            content: `Read the file with ID "1xXs08NoyMEBeUCRO_1vvxZi6hkQ3kYVt95d47yguykw" from Google Drive and analyze the cleaning business data.

Calculate and return ONLY a JSON object (no markdown, no preamble) with:
{
  "totalRevenue": sum of all fees,
  "totalCleanings": count of all cleaning entries,
  "totalExpenses": sum of all expenses,
  "netProfit": totalRevenue - totalExpenses,
  "topClients": array of top 5 clients by revenue [{name, revenue}],
  "recentAppointments": last 10 appointments [{date, client, fee}],
  "currentMonthRevenue": revenue for May 2026,
  "previousMonthRevenue": revenue for April 2026
}`
          }
        ],
        mcp_servers: [
          {
            "type": "url",
            "url": "https://drivemcp.googleapis.com/mcp/v1",
            "name": "google-drive"
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`API call failed: ${response.status}`);
    }

    const result = await response.json();
    
    // Extract text from response
    const textContent = result.content
      .filter(item => item.type === "text")
      .map(item => item.text)
      .join("\n");

    // Clean and parse JSON
    const cleanJson = textContent.replace(/```json|```/g, "").trim();
    const parsedData = JSON.parse(cleanJson);
    
    // Update cache
    cachedData = parsedData;
    cacheTime = Date.now();
    
    return Response.json({
      ...parsedData,
      cached: false,
      fetchedAt: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error fetching data:', error);
    
    // If we have cached data, return it as fallback
    if (cachedData) {
      return Response.json({
        ...cachedData,
        cached: true,
        warning: 'Using stale cache due to error: ' + error.message
      });
    }
    
    return Response.json(
      { 
        error: 'Failed to fetch data', 
        details: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
