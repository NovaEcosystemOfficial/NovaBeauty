"use client";

type NovaBeautySplashProps = {
  fadingOut: boolean;
};

export function NovaBeautySplash({ fadingOut }: NovaBeautySplashProps) {
  return (
    <div
      className={`nova-splash ${fadingOut ? "nova-splash--exit" : ""}`}
      role="presentation"
      aria-hidden="true"
    >
      <div className="nova-splash__backdrop" />
      <div className="nova-splash__light-sweep" />
      <div className="nova-splash__ambient" />

      <div className="nova-splash__content">
        <div className="nova-splash__ripple-stage" aria-hidden="true">
          <span className="nova-splash__ripple nova-splash__ripple--1" />
          <span className="nova-splash__ripple nova-splash__ripple--2" />
          <span className="nova-splash__ripple nova-splash__ripple--3" />
        </div>

        <div className="nova-splash__logo-wrap">
          <svg className="nova-splash__logo" viewBox="0 0 512 512" aria-hidden="true">
            <circle cx="256" cy="256" r="148" fill="rgb(var(--color-primary))" />
            <path
              fill="#FFFFFF"
              d="M256 139c37 52 76 91 118 117-42 26-81 65-118 117-37-52-76-91-118-117 42-26 81-65 118-117Z"
            />
            <circle cx="256" cy="256" r="34" fill="rgb(var(--color-secondary))" />
          </svg>
        </div>

        <h1 className="nova-splash__title">NovaBeauty</h1>
        <p className="nova-splash__tagline">La bellezza inizia dal tempo che dedichi a te stessa.</p>
      </div>
    </div>
  );
}
