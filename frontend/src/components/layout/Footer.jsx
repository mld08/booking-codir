import React from "react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const developers = [
    {
      name: "MLD",
      linkedin: "https://www.linkedin.com/in/mouhamadou-lamine-diop-30891423a/en/",
    },
    {
      name: "PAC",
      linkedin: "https://www.linkedin.com/in/pape-alassane-coly-a87a01204/",
    },
    {
      name: "BD",
      linkedin: "https://www.linkedin.com/in/babacar-diouf-a4939523a/",
    },
  ];

  return (
    <footer className="w-full bg-gray-100 border-t border-gray-200 mt-10">
      <div className="max-w-7xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
        
        {/* Copyright */}
        <p className="text-sm text-gray-600 text-center md:text-left">
          © {currentYear} Tous droits réservés.
        </p>

        {/* Devs */}
        <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
          <span>Développé par :</span>

          {developers.map((dev, index) => (
            <a
              key={index}
              href={dev.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-gray-800 hover:text-blue-600 transition"
            >
              {dev.name}
              {index < developers.length - 1 && ","}
            </a>
          ))}
        </div>

      </div>
    </footer>
  );
};

export default Footer;
