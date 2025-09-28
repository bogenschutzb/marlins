import { Header } from "../components/Header";
import GameStats from "../components/GameStats";

export default function Index() {
  return (
    <div className="min-h-screen min-w-[600px]">     
        {
         <div>
          <Header />     
          <main>          
            <GameStats />            
          </main>
        </div> 
      }      
    </div>
  );
}