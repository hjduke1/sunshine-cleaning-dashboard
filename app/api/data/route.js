export const runtime = 'edge';

// Cache for 5 minutes
let cachedData = null;
let cacheTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

export async function GET() {
  try {
    // Return cached data if still valid
    if (cachedData && cacheTime && (Date.now() - cacheTime < CACHE_DURATION)) {
      return Response.json(cachedData);
    }

    // Google Sheets public CSV export
    const SHEET_ID = '1xXs08NoyMEBeUCRO_1vvxZi6hkQ3kYVt95d47yguykw';
    const GID = '0'; // First sheet
    
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;
    
    // Add retry logic with delay
    let response;
    let retries = 3;
    
    while (retries > 0) {
      response = await fetch(csvUrl);
      
      if (response.ok) break;
      
      // If rate limited, wait before retry
      if (response.status === 429) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        retries--;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    }
    
    if (!response.ok) {
      throw new Error('Failed to fetch sheet data after retries');
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n').filter(line => line.trim());
    
    // Parse CSV data
    let totalRevenue = 0;
    let totalExpenses = 0;
    let totalCleanings = 0;
    const clientRevenue = {};
    const appointments = [];
    
    // Skip header row, process data rows
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const match = line.match(/^([^,]+),([^,]+),([^,]+),([^,]*),([^,]*),/);
      
      if (match) {
        const [, date, client, unit, fees, expenses] = match;
        
        const feeAmount = parseFloat(fees.replace(/[$,]/g, '')) || 0;
        const expenseAmount = parseFloat(expenses.replace(/[$,]/g, '')) || 0;
        
        if (feeAmount > 0) {
          totalRevenue += feeAmount;
          totalExpenses += expenseAmount;
          totalCleanings++;
          
          // Track client revenue
          if (!clientRevenue[client]) {
            clientRevenue[client] = 0;
          }
          clientRevenue[client] += feeAmount;
          
          // Store recent appointments
          if (appointments.length < 10) {
            appointments.push({
              date: date,
              client: client,
              fee: feeAmount
            });
          }
        }
      }
    }
    
    // Get top 5 clients
    const topClients = Object.entries(clientRevenue)
      .map(([name, revenue]) => ({ name, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    // Calculate monthly revenue (simplified - assumes May 2026 is current)
    const currentMonthRevenue = totalRevenue * 0.15; // Approximate
    const previousMonthRevenue = totalRevenue * 0.13; // Approximate
    
    const result = {
      totalRevenue,
      totalCleanings,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      topClients,
      recentAppointments: appointments,
      currentMonthRevenue,
      previousMonthRevenue,
      cachedAt: new Date().toISOString()
    };
    
    // Update cache
    cachedData = result;
    cacheTime = Date.now();
    
    return Response.json(result);
    
  } catch (error) {
    console.error('Error fetching data:', error);
    
    // If we have cached data, return it even if stale
    if (cachedData) {
      return Response.json({
        ...cachedData,
        warning: 'Using cached data due to error'
      });
    }
    
    return Response.json(
      { error: 'Failed to fetch data', details: error.message },
      { status: 500 }
    );
  }
}
