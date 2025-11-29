"use client";

import {
  ConversationSidebarProps,
  ConversationViewSidebar as ConversationViewSidebarEE,
} from "@/lib/ee-stubs/conversations";

export function ConversationSidebar(props: ConversationSidebarProps) {
  return <ConversationViewSidebarEE {...props} />;
}
