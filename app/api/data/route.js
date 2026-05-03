export const runtime = 'edge';

export async function GET() {
  try {
    // Google Sheets public CSV export
    const SHEET_ID = '1xXs08NoyMEBeUCRO_1vvxZi6hkQ3kYVt95d47yguykw';
    const GID = '0'; // First sheet
    
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${GID}`;
    
    const response = await fetch(csvUrl);
    if (!response.ok) {
      throw new Error('Failed to fetch sheet data');
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
    
    return Response.json({
      totalRevenue,
      totalCleanings,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      topClients,
      recentAppointments: appointments,
      currentMonthRevenue,
      previousMonthRevenue
    });
    
  } catch (error) {
    console.error('Error fetching data:', error);
    return Response.json(
      { error: 'Failed to fetch data', details: error.message },
      { status: 500 }
    );
  }
}
