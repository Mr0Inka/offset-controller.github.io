import { useState } from 'react';
import './Setup.css';

interface SetupProps {
  onSetupComplete: () => void;
}

export const Setup = ({ onSetupComplete }: SetupProps) => {
  const [token, setToken] = useState('');
  const [org, setOrg] = useState('');
  const [bucket, setBucket] = useState('');
  const [url, setUrl] = useState('https://us-east-1-1.aws.cloud2.influxdata.com');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToken, setShowToken] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    // Validate inputs
    if (!token.trim() || !org.trim() || !bucket.trim() || !url.trim()) {
      setError('Please fill in all fields');
      setIsSubmitting(false);
      return;
    }

    try {
      // Save to localStorage
      localStorage.setItem('influxdb_token', token.trim());
      localStorage.setItem('influxdb_org', org.trim());
      localStorage.setItem('influxdb_bucket', bucket.trim());
      localStorage.setItem('influxdb_url', url.trim());

      // Test the connection by creating a simple query
      const { InfluxDB } = await import('@influxdata/influxdb-client');
      const testClient = new InfluxDB({ url: url.trim(), token: token.trim() });
      const testQueryApi = testClient.getQueryApi(org.trim());

      // Try a simple query to verify credentials
      await new Promise<void>((resolve, reject) => {
        const testQuery = `
          from(bucket: "${bucket.trim()}")
            |> range(start: -1h)
            |> limit(n: 1)
        `;
        
        let hasResolved = false;
        testQueryApi.queryRows(testQuery, {
          next() {
            if (!hasResolved) {
              hasResolved = true;
              resolve();
            }
          },
          error(err) {
            if (!hasResolved) {
              hasResolved = true;
              reject(err);
            }
          },
          complete() {
            if (!hasResolved) {
              hasResolved = true;
              resolve();
            }
          },
        });
      });

      // If we get here, the connection works
      onSetupComplete();
    } catch (err: any) {
      console.error('Setup error:', err);
      setError(
        err?.message || 
        'Failed to connect to InfluxDB. Please check your credentials and try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="setup-container">
      <div className="setup-background-animation"></div>
      <div className="setup-content">
        <div className="setup-card">
          <div className="setup-header">
            <h1 className="setup-title">Offset Controller</h1>
            <p className="setup-subtitle">Configure your InfluxDB connection</p>
          </div>

          <form onSubmit={handleSubmit} className="setup-form">
            <div className="setup-form-group">
              <label htmlFor="url" className="setup-label">
                InfluxDB URL
              </label>
              <input
                id="url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://us-east-1-1.aws.cloud2.influxdata.com"
                className="setup-input"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="setup-form-group">
              <label htmlFor="token" className="setup-label">
                API Token
              </label>
              <div className="setup-input-wrapper">
                <input
                  id="token"
                  type={showToken ? 'text' : 'password'}
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  placeholder="Enter your InfluxDB API token"
                  className="setup-input"
                  disabled={isSubmitting}
                  required
                />
                <button
                  type="button"
                  className="setup-toggle-visibility"
                  onClick={() => setShowToken(!showToken)}
                  disabled={isSubmitting}
                  aria-label={showToken ? 'Hide token' : 'Show token'}
                >
                  {showToken ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                      <line x1="1" y1="1" x2="23" y2="23"></line>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="setup-form-group">
              <label htmlFor="org" className="setup-label">
                Organization
              </label>
              <input
                id="org"
                type="text"
                value={org}
                onChange={(e) => setOrg(e.target.value)}
                placeholder="Enter your organization ID"
                className="setup-input"
                disabled={isSubmitting}
                required
              />
            </div>

            <div className="setup-form-group">
              <label htmlFor="bucket" className="setup-label">
                Bucket
              </label>
              <input
                id="bucket"
                type="text"
                value={bucket}
                onChange={(e) => setBucket(e.target.value)}
                placeholder="Enter your bucket name"
                className="setup-input"
                disabled={isSubmitting}
                required
              />
            </div>

            {error && (
              <div className="setup-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="setup-submit-button"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="setup-spinner"></span>
                  Connecting...
                </>
              ) : (
                'Connect'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

