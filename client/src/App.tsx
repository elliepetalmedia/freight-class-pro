import { Suspense, lazy } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CookieBanner } from "@/components/cookie-banner";
import { Navigation } from "@/components/navigation";

const Home = lazy(() => import("@/pages/home"));
const About = lazy(() => import("@/pages/about"));
const Contact = lazy(() => import("@/pages/contact"));
const Privacy = lazy(() => import("@/pages/privacy"));
const FAQ = lazy(() => import("@/pages/faq"));
const CommodityLookup = lazy(() => import("@/pages/commodity-lookup"));
const BolGenerator = lazy(() => import("@/pages/bol-generator"));
const PalletOptimizer = lazy(() => import("@/pages/pallet-optimizer"));
const Guides = lazy(() => import("@/pages/guides"));
const GuideDetail = lazy(() => import("@/pages/guide-detail"));
const CommodityDetail = lazy(() => import("@/pages/commodity-detail"));
const NotFound = lazy(() => import("@/pages/not-found"));

function Router() {
  return (
    <Suspense fallback={<div className="container mx-auto px-4 py-16 text-center text-muted-foreground">Loading…</div>}>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/about" component={About} />
        <Route path="/contact" component={Contact} />
        <Route path="/privacy" component={Privacy} />
        <Route path="/faq" component={FAQ} />
        <Route path="/commodity-lookup" component={CommodityLookup} />
        <Route path="/commodity/:slug" component={CommodityDetail} />
        <Route path="/bol-generator" component={BolGenerator} />
        <Route path="/pallet-optimizer" component={PalletOptimizer} />
        <Route path="/guides" component={Guides} />
        <Route path="/guides/:slug" component={GuideDetail} />
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Navigation />
        <main className="flex-1">
          <Router />
        </main>
        <CookieBanner />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
