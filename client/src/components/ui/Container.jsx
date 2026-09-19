// Copyright (c) 2026 Karthik Raj. All rights reserved. https://beautiful-alpaca-6b1495.netlify.app/
import { cn } from "../../lib/utils";

export default function Container({ children, className }) {
  return <div className={cn("container-page", className)}>{children}</div>;
}
