import Footer from "@/components/Footer";
import HighlightsHome from "@/components/HighlightsHome";
import MapComponent from "@/components/MapComponent";
import ResponsiveAppBar from "@/components/ResponsiveAppBar";
import Statistics from "@/components/Statistics";

export default function Home() {
  return (
    <div>
      <div className="pb-6">
        <ResponsiveAppBar />
      </div>
      <div className="pb-6">
        <HighlightsHome />
        <MapComponent />
      </div>
      <Statistics />
      <Footer />
    </div>
  );
}
