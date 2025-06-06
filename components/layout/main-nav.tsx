"use client";

import type React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCart } from "@/context/cart-context";
import { ShoppingCart, Menu, X, User, LogOut, Pizza, Truck, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/utils/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "@/components/mode-toggle";
import { CartSidebar } from "@/components/cart-sidebar";

export function MainNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { totalItems } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    // Vérifier l'état de connexion au chargement
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'utilisateur:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkUser();

    // Écouter les changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  const getNavLinks = () => {
    const commonLinks = [
      { href: "/", label: "Accueil" },
      { href: "/pizzerias", label: "Pizzerias" },
      { href: "/support", label: "Support" },
    ];

    if (isLoading) return commonLinks;

    if (!user) return commonLinks;

    // Récupérer le rôle de l'utilisateur depuis les métadonnées
    const userRole = user.user_metadata?.role || 'client';

    switch (userRole) {
      case "client":
        return [...commonLinks, { href: "/commandes", label: "Mes Commandes" }];
      case "pizzeria":
        return [
          { href: "/pizzeria/dashboard", label: "Tableau de Bord" },
          { href: "/pizzeria/commandes", label: "Commandes" },
          { href: "/pizzeria/menu", label: "Menu" },
        ];
      case "livreur":
        return [
          { href: "/livreur/dashboard", label: "Tableau de Bord" },
          { href: "/livreur/livraisons", label: "Livraisons" },
        ];
      case "admin":
        return [
          { href: "/admin/dashboard", label: "Tableau de Bord" },
          { href: "/admin/pizzerias", label: "Pizzerias" },
          { href: "/admin/utilisateurs", label: "Utilisateurs" },
          { href: "/admin/commandes", label: "Commandes" },
        ];
      default:
        return commonLinks;
    }
  };

  const navLinks = getNavLinks();

  const getRoleIcon = () => {
    if (!user) return <User className="h-4 w-4 mr-2" />;

    const userRole = user.user_metadata?.role || 'client';

    switch (userRole) {
      case "client":
        return <User className="h-4 w-4 mr-2" />;
      case "pizzeria":
        return <Pizza className="h-4 w-4 mr-2" />;
      case "livreur":
        return <Truck className="h-4 w-4 mr-2" />;
      case "admin":
        return <ShieldCheck className="h-4 w-4 mr-2" />;
      default:
        return <User className="h-4 w-4 mr-2" />;
    }
  };

  const pizzerias = [
    { id: 1, name: "Pizza Napoli", slug: "Pizza Napoli" },
    { id: 2, name: "Pizzeria Roma", slug: "Pizzeria Roma" },
    { id: 3, name: "Pizza Hut Glass", slug: "Pizza Hut Glass" },
    { id: 4, name: "Mamma Mia Akanda", slug: "Mamma Mia Akanda" },
    { id: 5, name: "La Sauce Creole", slug: "La Sauce Creole" },
    { id: 6, name: "Tivoli", slug: "Tivoli" },
    { id: 7, name: "Yeunil", slug: "Yeunil" },
  ];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchQuery.trim().toLowerCase();

    // Trouver la pizzeria correspondante
    const pizzeria = pizzerias.find((p) => p.name.toLowerCase() === query);

    if (pizzeria) {
      // Rediriger vers la page dynamique de la pizzeria
      window.location.href = `/pizzeria/${pizzeria.id}`;
    } else {
      alert("Pizzeria non trouvée !");
    }
  };

  const toggleCart = () => {
    setCartOpen(!cartOpen);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background">
        <div className="container flex h-16 items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <div className="relative h-16 w-16 md:h-20 md:w-20">
                <Image src="/log.png" alt="Pizza Casa Logo" fill className="object-contain" />
              </div>
              <span className="text-2xl font-bold text-[#9B1B1B] font-montserrat">Pizza Casa</span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center justify-center space-x-6 text-sm font-medium flex-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-[#FFB000] relative group",
                  pathname === link.href ? "text-[#9B1B1B]" : "text-foreground"
                )}
              >
                {link.label}
                <span className="absolute left-0 bottom-0 w-0 h-0.5 bg-[#FFB000] transition-all duration-300 group-hover:w-full"></span>
                {pathname === link.href && <span className="absolute left-0 bottom-0 w-full h-0.5 bg-[#9B1B1B]"></span>}
              </Link>
            ))}
          </nav>

          {(!isLoading && (!user || user.user_metadata?.role !== "pizzeria")) && (
            <form onSubmit={handleSearch} className="hidden md:flex mx-4 flex-1 max-w-xs">
              <div className="relative w-full">
                <Input
                  type="search"
                  placeholder="Rechercher une pizzeria..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10"
                />
                <Button type="submit" size="sm" variant="ghost" className="absolute right-0 top-0 h-full px-3">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="lucide lucide-search"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                  <span className="sr-only">Rechercher</span>
                </Button>
              </div>
            </form>
          )}

          <div className="flex items-center space-x-2 ml-auto">
            {(!isLoading && (!user || user.user_metadata?.role === "client")) && (
              <Button variant="outline" size="icon" onClick={toggleCart} className="relative">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
                <span className="sr-only">Panier</span>
              </Button>
            )}

            <ModeToggle />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                  <span className="sr-only">Mon profil</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {isLoading ? (
                  <DropdownMenuItem disabled>
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Chargement...
                    </span>
                  </DropdownMenuItem>
                ) : user ? (
                  <>
                    <DropdownMenuLabel>
                      <div className="flex items-center gap-2">
                        {getRoleIcon()}
                        <span className="max-w-[150px] truncate">{user.email}</span>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile">
                        <User className="h-4 w-4 mr-2" />
                        Profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="h-4 w-4 mr-2" />
                      Déconnexion
                    </DropdownMenuItem>
                  </>
                ) : (
                  <>
                    <DropdownMenuLabel>Mon Compte</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/login">
                        <User className="h-4 w-4 mr-2" />
                        Connexion
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/register">
                        <User className="h-4 w-4 mr-2" />
                        Inscription
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              variant="outline"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t">
            <div className="container py-4 space-y-3">
              <form onSubmit={handleSearch} className="mb-2">
                <div className="relative w-full">
                  <Input
                    type="search"
                    placeholder="Rechercher une pizzeria..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pr-10"
                  />
                  <Button type="submit" size="sm" variant="ghost" className="absolute right-0 top-0 h-full px-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-search"
                    >
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                    <span className="sr-only">Rechercher</span>
                  </Button>
                </div>
              </form>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "block py-2 text-center transition-colors hover:text-foreground/80",
                    pathname === link.href ? "text-foreground font-bold" : "text-foreground/60"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Panier latéral */}
      <CartSidebar isOpen={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}