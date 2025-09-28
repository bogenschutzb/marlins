import { ImageWithFallback } from "./helper/ImageWithFallback";
import logo from "../assets/bblogo.png";

export function Header() {
  const currentYear = new Date().getFullYear();

  return (
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
  );
}