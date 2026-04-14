/**
 * SaaS Admin Panel Button Variants
 * Reusable button class utilities for consistent styling across the application
 */

export const buttonVariants = {
  // Primary action buttons - for main CTAs
  primary: "h-10 px-6 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-md transition-all duration-200",
  primarySm: "h-8 px-4 font-medium bg-primary hover:bg-primary/90 text-primary-foreground transition-colors",
  primaryLg: "h-12 px-8 font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg transition-all duration-200",

  // Success/Create buttons - for creation and positive actions
  success: "h-10 px-6 font-semibold bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md transition-all duration-200",
  successSm: "h-8 px-4 font-medium bg-green-600 hover:bg-green-700 text-white transition-colors",

  // Accent/Secondary buttons - for secondary actions
  accent: "h-10 px-6 font-medium bg-accent hover:bg-accent/90 text-accent-foreground transition-colors",
  accentSm: "h-8 px-3 text-xs font-medium bg-accent/10 hover:bg-accent/20 text-accent transition-colors",

  // Destructive/Delete buttons - for dangerous actions
  destructive: "h-10 px-6 font-semibold bg-red-600 hover:bg-red-700 text-white shadow-md transition-all duration-200",
  destructiveSm: "h-8 px-3 text-xs font-medium bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 transition-colors",

  // Ghost/Subtle buttons - for less important actions
  ghost: "h-10 px-6 font-medium text-foreground hover:bg-muted transition-colors",
  ghostSm: "h-8 px-4 font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",

  // Outline buttons - for secondary actions with border
  outline: "h-10 px-6 font-medium border-2 border-input bg-transparent hover:bg-muted transition-colors",
  outlineSm: "h-8 px-4 font-medium border border-input hover:bg-muted transition-colors",

  // Disabled state
  disabled: "opacity-50 cursor-not-allowed",

  // Full width
  fullWidth: "w-full",

  // Icon button
  icon: "h-10 w-10 p-0 rounded-lg hover:bg-muted transition-colors",
  iconSm: "h-8 w-8 p-0 rounded-lg hover:bg-muted transition-colors",
}

export const buttonClassNames = {
  primary: buttonVariants.primary,
  primarySm: buttonVariants.primarySm,
  primaryLg: buttonVariants.primaryLg,
  success: buttonVariants.success,
  successSm: buttonVariants.successSm,
  accent: buttonVariants.accent,
  accentSm: buttonVariants.accentSm,
  destructive: buttonVariants.destructive,
  destructiveSm: buttonVariants.destructiveSm,
  ghost: buttonVariants.ghost,
  ghostSm: buttonVariants.ghostSm,
  outline: buttonVariants.outline,
  outlineSm: buttonVariants.outlineSm,
}
