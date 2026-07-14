import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import SiteLayout from "./components/SiteLayout";
import { CartProvider } from "./contexts/CartContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import Admin from "./pages/Admin";
import CartPage from "./pages/CartPage";
import Contact from "./pages/Contact";
import CustomOrders from "./pages/CustomOrders";
import Faq from "./pages/Faq";
import Home from "./pages/Home";
import OrderConfirmation from "./pages/OrderConfirmation";
import OurStory from "./pages/OurStory";
import ProductDetail from "./pages/ProductDetail";
import Shop from "./pages/Shop";

function Router() {
  return (
    <SiteLayout>
      <Switch>
        <Route path={"/"} component={Home} />
        <Route path={"/shop"} component={Shop} />
        <Route path={"/product/:slug"} component={ProductDetail} />
        <Route path={"/cart"} component={CartPage} />
        <Route path={"/order/confirmation"} component={OrderConfirmation} />
        <Route path={"/custom-orders"} component={CustomOrders} />
        <Route path={"/our-story"} component={OurStory} />
        <Route path={"/faq"} component={Faq} />
        <Route path={"/contact"} component={Contact} />
        <Route path={"/admin"} component={Admin} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </SiteLayout>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <CartProvider>
            <Toaster />
            <Router />
          </CartProvider>
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
