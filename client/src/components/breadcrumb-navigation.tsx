import { Link } from "wouter";
import { ChevronRight, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface BreadcrumbItem {
  label: string;
  href?: string;
  current?: boolean;
}

interface BreadcrumbNavigationProps {
  items: BreadcrumbItem[];
  className?: string;
}

export function BreadcrumbNavigation({ items, className = "" }: BreadcrumbNavigationProps) {
  return (
    <nav aria-label="Breadcrumb" className={`mb-6 ${className}`}>
      <ol className="flex items-center space-x-2 text-sm">
        {/* Home icon */}
        <li>
          <Link href="/">
            <Button variant="ghost" size="sm" className="h-6 px-2">
              <Home className="w-3 h-3" />
            </Button>
          </Link>
        </li>

        {items.map((item, index) => (
          <li key={index} className="flex items-center space-x-2">
            <ChevronRight className="w-3 h-3 text-muted-foreground" />
            {item.href && !item.current ? (
              <Link href={item.href}>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-muted-foreground hover:text-foreground">
                  {item.label}
                </Button>
              </Link>
            ) : (
              <span className={`px-2 py-1 text-xs font-medium ${
                item.current 
                  ? "text-foreground bg-primary/10 rounded" 
                  : "text-muted-foreground"
              }`}>
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}