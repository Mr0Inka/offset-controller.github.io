import { useState, useEffect } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  targetPoints: number;
  onTargetPointsChange: (points: number) => void;
}

export const Sidebar = ({
  isOpen,
  onClose,
  targetPoints,
  onTargetPointsChange,
}: SidebarProps) => {
  const [influxUrl, setInfluxUrl] = useState('');
  const [influxToken, setInfluxToken] = useState('');
  const [influxOrg, setInfluxOrg] = useState('');
  const [influxBucket, setInfluxBucket] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showToken, setShowToken] = useState(false);

  // Load InfluxDB credentials from localStorage
  useEffect(() => {
    if (isOpen) {
      setInfluxUrl(localStorage.getItem('influxdb_url') || '');
      setInfluxToken(localStorage.getItem('influxdb_token') || '');
      setInfluxOrg(localStorage.getItem('influxdb_org') || '');
      setInfluxBucket(localStorage.getItem('influxdb_bucket') || '');
      setSaveError(null);
      setSaveSuccess(false);
    }
  }, [isOpen]);

  const handleSaveCredentials = async () => {
    if (!influxUrl.trim() || !influxToken.trim() || !influxOrg.trim() || !influxBucket.trim()) {
      setSaveError('All fields are required');
      return;
    }

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      // Test the connection
      const { InfluxDB } = await import('@influxdata/influxdb-client');
      const testClient = new InfluxDB({ url: influxUrl.trim(), token: influxToken.trim() });
      const testQueryApi = testClient.getQueryApi(influxOrg.trim());

      await new Promise<void>((resolve, reject) => {
        const testQuery = `
          from(bucket: "${influxBucket.trim()}")
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

      // Save to localStorage
      localStorage.setItem('influxdb_url', influxUrl.trim());
      localStorage.setItem('influxdb_token', influxToken.trim());
      localStorage.setItem('influxdb_org', influxOrg.trim());
      localStorage.setItem('influxdb_bucket', influxBucket.trim());

      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        // Refresh the page to reinitialize with new credentials
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      console.error('Save credentials error:', err);
      setSaveError(
        err?.message || 
        'Failed to connect to InfluxDB. Please check your credentials and try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveCredentials = () => {
    if (window.confirm('Are you sure you want to remove all InfluxDB credentials? You will need to set them up again.')) {
      localStorage.removeItem('influxdb_url');
      localStorage.removeItem('influxdb_token');
      localStorage.removeItem('influxdb_org');
      localStorage.removeItem('influxdb_bucket');
      // Refresh the page to show the setup screen
      window.location.reload();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="sidebar-overlay" onClick={onClose}></div>
      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <h2>Settings</h2>
          <button className="sidebar-close" onClick={onClose} aria-label="Close sidebar">
            ×
          </button>
        </div>
        <div className="sidebar-content">
          <div className="settings-section">
            <h3 className="settings-title">Data Points</h3>
            <div className="settings-item">
              <label className="settings-label">
                <span>Points per Timeframe</span>
                <div className="settings-input-group">
                  <input
                    type="number"
                    min="100"
                    max="10000"
                    value={targetPoints}
                    onChange={(e) => onTargetPointsChange(parseInt(e.target.value, 10) || 1440)}
                    className="settings-input"
                  />
                  <button
                    className="settings-reset-btn"
                    onClick={() => onTargetPointsChange(1440)}
                  >
                    Reset
                  </button>
                </div>
              </label>
            </div>
          </div>
          <div className="settings-section">
            <h3 className="settings-title">InfluxDB Connection</h3>
            <div className="settings-item">
              <label className="settings-label settings-label-column">
                <span>URL</span>
                <input
                  type="text"
                  value={influxUrl}
                  onChange={(e) => setInfluxUrl(e.target.value)}
                  placeholder="https://us-east-1-1.aws.cloud2.influxdata.com"
                  className="settings-input settings-input-full"
                  disabled={isSaving}
                />
              </label>
            </div>
            <div className="settings-item">
              <label className="settings-label settings-label-column">
                <span>API Token</span>
                <div className="settings-input-wrapper">
                  <input
                    type={showToken ? 'text' : 'password'}
                    value={influxToken}
                    onChange={(e) => setInfluxToken(e.target.value)}
                    placeholder="Enter your API token"
                    className="settings-input settings-input-full"
                    disabled={isSaving}
                  />
                  <button
                    type="button"
                    className="settings-toggle-visibility"
                    onClick={() => setShowToken(!showToken)}
                    disabled={isSaving}
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
              </label>
            </div>
            <div className="settings-item">
              <label className="settings-label settings-label-column">
                <span>Organization</span>
                <input
                  type="text"
                  value={influxOrg}
                  onChange={(e) => setInfluxOrg(e.target.value)}
                  placeholder="Enter organization ID"
                  className="settings-input settings-input-full"
                  disabled={isSaving}
                />
              </label>
            </div>
            <div className="settings-item">
              <label className="settings-label settings-label-column">
                <span>Bucket</span>
                <input
                  type="text"
                  value={influxBucket}
                  onChange={(e) => setInfluxBucket(e.target.value)}
                  placeholder="Enter bucket name"
                  className="settings-input settings-input-full"
                  disabled={isSaving}
                />
              </label>
            </div>
            {saveError && (
              <div className="settings-error">
                {saveError}
              </div>
            )}
            {saveSuccess && (
              <div className="settings-success">
                Credentials saved successfully! Refreshing...
              </div>
            )}
            <div className="settings-item settings-buttons-group">
              <button
                className="settings-save-btn"
                onClick={handleSaveCredentials}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <span className="settings-spinner"></span>
                    Saving...
                  </>
                ) : (
                  'Save Credentials'
                )}
              </button>
              <button
                className="settings-remove-btn"
                onClick={handleRemoveCredentials}
                disabled={isSaving}
              >
                Remove Credentials
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

