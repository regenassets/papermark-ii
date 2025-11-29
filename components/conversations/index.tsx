"use client";

import { ConversationListItem as ConversationListItemEE } from "@/lib/ee-stubs/conversations";
import { ConversationMessage as ConversationMessageEE } from "@/lib/ee-stubs/conversations";

export function ConversationListItem(props: any) {
  return <ConversationListItemEE {...props} />;
}

export function ConversationMessage(props: any) {
  return <ConversationMessageEE {...props} />;
}
