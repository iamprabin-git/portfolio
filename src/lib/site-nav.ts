/** Primary routes — keep in sync with header & footer column “Site”. */
export const primaryNavLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/skills", label: "Skills" },
  { href: "/projects", label: "Projects" },
  { href: "/contact", label: "Contact" },
] as const;

/** Homepage section anchors for footer “Quick links”. */
export const footerQuickLinks = [
  { href: "/#about", label: "About" },
  { href: "/#skills", label: "Skills" },
  { href: "/#projects", label: "Projects" },
  { href: "/#sponsors", label: "Sponsors" },
  { href: "/#reviews", label: "Reviews" },
] as const;
