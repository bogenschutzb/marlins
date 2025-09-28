import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ImageWithFallback } from "../components/helper/ImageWithFallback";
import logo from "../assets/bblogo.png";

const NotFound = () => {
  const location = useLocation();
    const currentYear = new Date().getFullYear();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
     <div className="min-h-screen flex flex-col">
       <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex flex-row items-center gap-2">
          <ImageWithFallback src={logo} alt="logo" className="w-9 h-9 object-contain"/>
          <div className="tracking-tight font-semibold">
            Marlins - Example App
          </div>               
        </div>       
         <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            © {currentYear} Bradley Bogenschutz. All rights reserved.
          </div>                  
        </div>    
      </div>
    </header>
      <main className="flex-grow pt-20 flex flex-col">
        <div className="flex flex-grow min-h-min items-center justify-center ">
          <div className="text-center">
            <h1 className="mb-4 text-4xl font-bold">404</h1>
            <p className="mb-4 text-xl text-gray-600">Oops! Page not found</p>
            <a href="/" className="text-blue-500 underline hover:text-blue-700">
              Return to Home
            </a>
          </div>
        </div>
      </main>
    </div>
    
  );
};

export default NotFound;