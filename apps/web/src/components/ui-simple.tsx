"use client";

// Simple UI components without TailwindCSS or shadcn/ui

export function Input({ placeholder, value, onChange, className = "", style = {} }: {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  style?: React.CSSProperties;
}) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      style={{
        padding: "0.5rem 0.75rem",
        border: "1px solid #d1d5db",
        borderRadius: "0.375rem",
        fontSize: "0.875rem",
        width: "100%",
        maxWidth: "20rem",
        outline: "none",
        transition: "border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out",
        ...style
      }}
      className={className}
      onFocus={(e) => {
        e.target.style.borderColor = "#3b82f6";
        e.target.style.boxShadow = "0 0 0 0.2rem rgba(59, 130, 246, 0.25)";
      }}
      onBlur={(e) => {
        e.target.style.borderColor = "#d1d5db";
        e.target.style.boxShadow = "none";
      }}
    />
  );
}

export function Button({ children, onClick, variant = "default", size = "default", disabled = false, className = "", style = {}, type = "button" }: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "default" | "outline" | "ghost";
  size?: "sm" | "default" | "lg";
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
  type?: "button" | "submit" | "reset";
}) {
  const getStyles = () => {
    const baseStyles = {
      display: "inline-flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "0.375rem",
      fontWeight: "500",
      transition: "all 0.15s ease-in-out",
      cursor: disabled ? "not-allowed" : "pointer",
      border: "1px solid transparent"
    } as React.CSSProperties;

    let sizeStyles: React.CSSProperties = {};
    switch (size) {
      case "sm":
        sizeStyles = {
          padding: "0.25rem 0.5rem",
          fontSize: "0.875rem",
          height: "2rem"
        };
        break;
      case "lg":
        sizeStyles = {
          padding: "0.75rem 1.5rem",
          fontSize: "1.125rem",
          height: "3rem"
        };
        break;
      default:
        sizeStyles = {
          padding: "0.5rem 1rem",
          fontSize: "0.875rem",
          height: "2.5rem"
        };
    }

    let variantStyles: React.CSSProperties = {};
    switch (variant) {
      case "outline":
        variantStyles = {
          backgroundColor: "#ffffff",
          borderColor: "#d1d5db",
          color: "#374151"
        };
        break;
      case "ghost":
        variantStyles = {
          backgroundColor: "transparent",
          color: "#374151"
        };
        break;
      default:
        variantStyles = {
          backgroundColor: "#3b82f6",
          color: "#ffffff",
          borderColor: "#3b82f6"
        };
    }

    if (disabled) {
      variantStyles = {
        ...variantStyles,
        backgroundColor: "#e5e7eb",
        borderColor: "#e5e7eb",
        color: "#9ca3af",
        cursor: "not-allowed"
      };
    }

    return { ...baseStyles, ...sizeStyles, ...variantStyles, ...style };
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      type={type}
      style={getStyles()}
      className={className}
      onMouseOver={(e) => {
        if (!disabled && variant === "outline") {
          (e.target as HTMLButtonElement).style.backgroundColor = "#f9fafb";
        } else if (!disabled && variant === "default") {
          (e.target as HTMLButtonElement).style.backgroundColor = "#2563eb";
        }
      }}
      onMouseOut={(e) => {
        if (!disabled && variant === "outline") {
          (e.target as HTMLButtonElement).style.backgroundColor = "#ffffff";
        } else if (!disabled && variant === "default") {
          (e.target as HTMLButtonElement).style.backgroundColor = "#3b82f6";
        }
      }}
    >
      {children}
    </button>
  );
}

export function Badge({ children, variant = "secondary", className = "" }: {
  children: React.ReactNode;
  variant?: "default" | "secondary";
  className?: string;
}) {
  const getStyles = () => {
    if (variant === "default") {
      return {
        display: "inline-flex",
        alignItems: "center",
        padding: "0.125rem 0.5rem",
        borderRadius: "9999px",
        fontSize: "0.75rem",
        fontWeight: "500",
        backgroundColor: "#3b82f6",
        color: "#ffffff"
      };
    }
    
    return {
      display: "inline-flex",
      alignItems: "center",
      padding: "0.125rem 0.5rem",
      borderRadius: "9999px",
      fontSize: "0.75rem",
      fontWeight: "500",
      backgroundColor: "#f3f4f6",
      color: "#374151"
    };
  };

  return (
    <span style={getStyles()} className={className}>
      {children}
    </span>
  );
}
