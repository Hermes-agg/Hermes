import { useState, useEffect } from "react";
import logo_light from "../../public/hermes-logo.png";
import logo_dark from "../../public/hermes-dark-logo.png";

// const app_logo = logo_light;

const logoNGN = "/img/NGN.svg";

const solana_logo = "/icons/sol.svg";

export { logoNGN, solana_logo };

const useAppLogo = () => {
  const [appLogo, setAppLogo] = useState(logo_light);

  useEffect(() => {
    // Function to update logo based on theme
    const updateLogo = () => {
      const isDark = document.documentElement.classList.contains("dark");
      setAppLogo(isDark ? logo_dark : logo_light);
    };

    updateLogo(); // initial check

    // Optional: listen for theme changes if you toggle dynamically
    const observer = new MutationObserver(updateLogo);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return appLogo;
};

export default useAppLogo;
