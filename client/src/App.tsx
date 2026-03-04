import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Home from "@/pages/home";
import About from "@/pages/about";
import Contact from "@/pages/contact";
import Privacy from "@/pages/privacy";
import FAQ from "@/pages/faq";
import CommodityLookup from "@/pages/commodity-lookup";
import BolGenerator from "@/pages/bol-generator";
import PalletOptimizer from "@/pages/pallet-optimizer";
import NotFound from "@/pages/not-found";
import { CookieBanner } from "@/components/cookie-banner";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/contact" component={Contact} />
      <Route path="/privacy" component={Privacy} />
      <Route path="/faq" component={FAQ} />
      <Route path="/commodity-lookup" component={CommodityLookup} />
      <Route path="/bol-generator" component={BolGenerator} />
      <Route path="/pallet-optimizer" component={PalletOptimizer} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
        <CookieBanner />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
