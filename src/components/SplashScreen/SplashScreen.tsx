interface SplashScreenProps {
  hiding: boolean;
}

export const SplashScreen = ({ hiding }: SplashScreenProps) => (
  <div className={`splash-screen ${hiding ? 'hiding' : ''}`}>
    <div className="splash-background-animation"></div>
    <div className="splash-content">
      <h1 className="splash-title">Offset Controller</h1>
      <div className="splash-subtitle">Temperature Monitoring System</div>
      <div className="splash-spinner">
        <div className="spinner-circle"></div>
      </div>
    </div>
  </div>
);

