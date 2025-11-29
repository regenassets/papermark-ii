"use client";

import {
  DataroomLinkSheet as DataroomLinkSheetEE,
  type ItemPermission as ItemPermissionEE,
} from "@/lib/ee-stubs/permissions";

export type ItemPermission = ItemPermissionEE;

export function DataroomLinkSheet(props: any) {
  return <DataroomLinkSheetEE {...props} />;
}
