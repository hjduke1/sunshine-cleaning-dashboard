'use client';

import React, { useState, useEffect } from 'react';
import { TrendingUp, Users, DollarSign, Calendar, RefreshCw, Sparkles } from 'lucide-react';

export default function SunshineDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [
            {
              role: "user",
              content: `Read the Google Sheet "SunshinesCleaning Master Sheet 2026" (file ID: 1xXs08NoyMEBeUCRO_1vvxZi6hkQ3kYVt95d47yguykw) and extract the following metrics from the data:

1. Total revenue (sum of all fees)
2. Total number of cleanings
3. Total expenses
4. Total net profit
5. Top 5 clients by revenue
6. Last 10 appointments with date, client, and fee
7. Current month revenue (May 2026)
8. Previous month revenue (April 2026)

Return ONLY a JSON object with this exact structure, no preamble or markdown:
{
  "totalRevenue": number,
  "totalCleanings": number,
  "totalExpenses": number,
  "netProfit": number,
  "topClients": [{"name": "string", "revenue": number}],
  "recentAppointments": [{"date": "string", "client": "string", "fee": number}],
  "currentMonthRevenue": number,
  "previousMonthRevenue": number
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

      const result = await response.json();
      
      // Extract text from all content blocks
      const textContent = result.content
        .filter(item => item.type === "text")
        .map(item => item.text)
        .join("\n");

      // Clean and parse JSON
      const cleanJson = textContent.replace(/```json|```/g, "").trim();
      const parsedData = JSON.parse(cleanJson);
      
      setData(parsedData);
      setLastRefresh(new Date());
    } catch (err) {
      setError(err.message);
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif"
      }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: '4px solid rgba(255,255,255,0.3)',
            borderTopColor: 'white',
            borderRadius: '50%',
            margin: '0 auto 20px',
            animation: 'spin 1s linear infinite'
          }}></div>
          <p style={{ fontSize: '18px', fontWeight: '500' }}>Loading Sunshine Cleaning data...</p>
        </div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
        padding: '20px'
      }}>
        <div style={{
          background: 'white',
          padding: '40px',
          borderRadius: '20px',
          maxWidth: '500px',
          textAlign: 'center'
        }}>
          <h2 style={{ color: '#e53e3e', marginBottom: '15px' }}>Error Loading Data</h2>
          <p style={{ color: '#4a5568', marginBottom: '25px' }}>{error}</p>
          <button
            onClick={fetchData}
            style={{
              padding: '12px 30px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '10px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const revenueGrowth = data.currentMonthRevenue && data.previousMonthRevenue
    ? ((data.currentMonthRevenue - data.previousMonthRevenue) / data.previousMonthRevenue * 100).toFixed(1)
    : 0;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #e0f2fe 0%, #bfdbfe 50%, #ddd6fe 100%)',
      fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, sans-serif",
      padding: '30px 20px'
    }}>
      {/* Header */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto 30px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{
            width: '60px',
            height: '60px',
            background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 10px 30px rgba(6, 182, 212, 0.3)'
          }}>
            <Sparkles size={32} color="white" />
          </div>
          <div>
            <h1 style={{
              fontSize: '32px',
              fontWeight: '700',
              margin: '0',
              background: 'linear-gradient(135deg, #0891b2 0%, #6366f1 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              letterSpacing: '-0.02em'
            }}>
              Sunshine Cleaning
            </h1>
            <p style={{
              margin: '2px 0 0',
              color: '#64748b',
              fontSize: '14px',
              fontWeight: '500'
            }}>
              Live Dashboard · Updated {formatTime(lastRefresh)}
            </p>
          </div>
        </div>
        
        <button
          onClick={fetchData}
          style={{
            padding: '12px 24px',
            background: 'white',
            color: '#0891b2',
            border: '2px solid #0891b2',
            borderRadius: '12px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s',
            boxShadow: '0 4px 12px rgba(8, 145, 178, 0.15)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = '#0891b2';
            e.currentTarget.style.color = 'white';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.color = '#0891b2';
          }}
        >
          <RefreshCw size={18} />
          Refresh Data
        </button>
      </div>

      <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
        {/* Key Metrics */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '20px',
          marginBottom: '30px'
        }}>
          <MetricCard
            icon={<DollarSign size={28} />}
            title="Total Revenue"
            value={formatCurrency(data.totalRevenue)}
            subtitle={`${data.totalCleanings} cleanings completed`}
            gradient="linear-gradient(135deg, #10b981 0%, #059669 100%)"
          />
          
          <MetricCard
            icon={<TrendingUp size={28} />}
            title="Net Profit"
            value={formatCurrency(data.netProfit)}
            subtitle={`After $${data.totalExpenses.toFixed(0)} in expenses`}
            gradient="linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
          />
          
          <MetricCard
            icon={<Calendar size={28} />}
            title="This Month"
            value={formatCurrency(data.currentMonthRevenue)}
            subtitle={revenueGrowth > 0 ? `↑ ${revenueGrowth}% from last month` : `↓ ${Math.abs(revenueGrowth)}% from last month`}
            gradient="linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)"
          />
        </div>

        {/* Main Content Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
          gap: '20px'
        }}>
          {/* Top Clients */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '25px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Users size={22} color="white" />
              </div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                margin: '0',
                color: '#1e293b'
              }}>
                Top Clients
              </h2>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {data.topClients.map((client, index) => (
                <div key={index} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '15px',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '36px',
                      height: '36px',
                      background: 'linear-gradient(135deg, #06b6d4 0%, #0891b2 100%)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '700',
                      fontSize: '14px'
                    }}>
                      {index + 1}
                    </div>
                    <span style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      color: '#334155'
                    }}>
                      {client.name}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '16px',
                    fontWeight: '700',
                    color: '#10b981'
                  }}>
                    {formatCurrency(client.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Appointments */}
          <div style={{
            background: 'white',
            borderRadius: '20px',
            padding: '30px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '25px'
            }}>
              <div style={{
                width: '40px',
                height: '40px',
                background: 'linear-gradient(135deg, #ec4899 0%, #db2777 100%)',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Calendar size={22} color="white" />
              </div>
              <h2 style={{
                fontSize: '20px',
                fontWeight: '700',
                margin: '0',
                color: '#1e293b'
              }}>
                Recent Appointments
              </h2>
            </div>
            
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              maxHeight: '400px',
              overflowY: 'auto'
            }}>
              {data.recentAppointments.map((apt, index) => (
                <div key={index} style={{
                  padding: '15px',
                  background: '#f8fafc',
                  borderRadius: '12px',
                  borderLeft: '4px solid #06b6d4'
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'start',
                    marginBottom: '6px'
                  }}>
                    <span style={{
                      fontSize: '15px',
                      fontWeight: '600',
                      color: '#1e293b'
                    }}>
                      {apt.client}
                    </span>
                    <span style={{
                      fontSize: '15px',
                      fontWeight: '700',
                      color: '#10b981'
                    }}>
                      {formatCurrency(apt.fee)}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '13px',
                    color: '#64748b',
                    fontWeight: '500'
                  }}>
                    {apt.date}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, title, value, subtitle, gradient }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '20px',
      padding: '28px',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: '-30px',
        right: '-30px',
        width: '120px',
        height: '120px',
        background: gradient,
        opacity: '0.1',
        borderRadius: '50%'
      }}></div>
      
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '15px',
        marginBottom: '15px'
      }}>
        <div style={{
          width: '50px',
          height: '50px',
          background: gradient,
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 20px rgba(0, 0, 0, 0.15)'
        }}>
          {React.cloneElement(icon, { color: 'white' })}
        </div>
        <div>
          <p style={{
            margin: '0 0 4px',
            fontSize: '14px',
            color: '#64748b',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {title}
          </p>
          <h3 style={{
            margin: '0',
            fontSize: '28px',
            fontWeight: '800',
            color: '#1e293b',
            letterSpacing: '-0.02em'
          }}>
            {value}
          </h3>
        </div>
      </div>
      
      <p style={{
        margin: '0',
        fontSize: '13px',
        color: '#64748b',
        fontWeight: '500'
      }}>
        {subtitle}
      </p>
    </div>
  );
}
