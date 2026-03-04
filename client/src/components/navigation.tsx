import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, Package, LayoutGrid, FileText, Calculator, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navigation() {
    const [location] = useLocation();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    const closeMenu = () => setMobileMenuOpen(false);

    const navLinks = [
        { path: "/", label: "Home", icon: Calculator },
        { path: "/faq", label: "FAQ", icon: HelpCircle },
    ];

    const tools = [
        { path: "/commodity-lookup", label: "Commodity Lookup", icon: Package },
        { path: "/pallet-optimizer", label: "Pallet Optimizer", icon: LayoutGrid },
        { path: "/bol-generator", label: "BOL Generator", icon: FileText },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link href="/">
                        <a className="flex items-center gap-2 font-bold text-lg text-primary tracking-tight" onClick={closeMenu}>
                            <Package className="h-6 w-6" />
                            FreightClassPro
                        </a>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {navLinks.map((link) => (
                            <Link key={link.path} href={link.path}>
                                <a className={`px-4 py-2 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground flex items-center gap-2 ${location === link.path ? 'bg-secondary text-secondary-foreground' : 'text-foreground/80'}`}>
                                    <link.icon className="h-4 w-4" />
                                    {link.label}
                                </a>
                            </Link>
                        ))}

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="text-sm font-medium text-foreground/80 hover:text-foreground">
                                    Tools <span className="ml-1 opacity-50">▾</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                {tools.map((tool) => (
                                    <DropdownMenuItem key={tool.path} asChild>
                                        <Link href={tool.path}>
                                            <a className="flex items-center gap-2 w-full cursor-pointer">
                                                <tool.icon className="h-4 w-4" />
                                                <span>{tool.label}</span>
                                            </a>
                                        </Link>
                                    </DropdownMenuItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <div className="pl-4 ml-4 border-l border-border h-6 flex items-center">
                            <Button asChild size="sm">
                                <Link href="/">Try Calculator</Link>
                            </Button>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="md:hidden flex items-center">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="text-foreground"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {mobileMenuOpen && (
                <div className="md:hidden bg-background border-b border-border absolute w-full left-0 top-16 shadow-lg pb-4 pt-2 px-4 flex flex-col gap-1">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-2 px-2">Menu</div>
                    {navLinks.map((link) => (
                        <Link key={link.path} href={link.path}>
                            <a
                                onClick={closeMenu}
                                className={`px-4 py-3 rounded-md text-base font-medium flex items-center gap-3 ${location === link.path ? 'bg-secondary text-secondary-foreground' : 'text-foreground/80 hover:bg-accent'}`}
                            >
                                <link.icon className="h-5 w-5" />
                                {link.label}
                            </a>
                        </Link>
                    ))}

                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 mt-4 px-2">Tools</div>
                    {tools.map((tool) => (
                        <Link key={tool.path} href={tool.path}>
                            <a
                                onClick={closeMenu}
                                className={`px-4 py-3 rounded-md text-base font-medium flex items-center gap-3 ${location === tool.path ? 'bg-secondary text-secondary-foreground' : 'text-foreground/80 hover:bg-accent'}`}
                            >
                                <tool.icon className="h-5 w-5" />
                                {tool.label}
                            </a>
                        </Link>
                    ))}
                </div>
            )}
        </nav>
    );
}
