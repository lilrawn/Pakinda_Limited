import { Link } from "react-router-dom";

const NotFound = () => (
  <div className="min-h-screen bg-background flex items-center justify-center px-6">
    <div className="text-center">
      <span className="eyebrow block mb-4 text-foreground/40">404 · Page Not Found</span>
      <h1 className="font-display text-5xl md:text-7xl mb-8">
        Wrong <span className="italic text-steel">turn.</span>
      </h1>
      <Link to="/" className="btn-vault inline-flex">Return to Pakinda Limited</Link>
    </div>
  </div>
);

export default NotFound;
