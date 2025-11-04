"use client";

import type React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Card } from "./ui/card";

export interface Column<T> {
  key: string;
  header: string;
  render?: (item: T, index: number) => React.ReactNode;
  accessor?: (item: T) => any;
  headerClassName?: string;
  cellClassName?: string;
  width?: string;
  align?: "left" | "center" | "right";
}

export interface Action<T> {
  label?: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick: (item: T, index: number) => void;
  className?: string;
  variant?: "default" | "ghost" | "outline" | "destructive";
  size?: "default" | "sm" | "lg" | "icon";
  show?: (item: T) => boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: Action<T>[];
  keyExtractor?: (item: T, index: number) => string | number;
  emptyMessage?: string;
  wrapInCard?: boolean;
  containerClassName?: string;
  tableClassName?: string;
  showSerialNumber?: boolean;
  serialNumberHeader?: string;
  rowClassName?: string | ((item: T, index: number) => string);
  headerRowClassName?: string;
  hoverEffect?: boolean;
}

export function DataTable<T>({
  data,
  columns,
  actions,
  keyExtractor,
  emptyMessage = "No data available",
  wrapInCard = false,
  containerClassName = "",
  tableClassName = "",
  showSerialNumber = false,
  serialNumberHeader = "Sr. No.",
  rowClassName,
  headerRowClassName = "",
  hoverEffect = true,
}: DataTableProps<T>) {
  const defaultKeyExtractor = (item: T, index: number) => {
    if (typeof item === "object" && item !== null && "id" in item) {
      return (item as any).id;
    }
    return index;
  };

  const getKey = keyExtractor || defaultKeyExtractor;

  const getRowClassName = (item: T, index: number) => {
    const baseClass = `border-b border-slate-100 ${
      hoverEffect
        ? "hover:bg-gradient-to-r hover:from-slate-50 hover:to-blue-50/30 transition-all duration-200"
        : ""
    }`;
    if (typeof rowClassName === "function") {
      return `${baseClass} ${rowClassName(item, index)}`;
    }
    return rowClassName ? `${baseClass} ${rowClassName}` : baseClass;
  };

  const getAlignment = (align?: "left" | "center" | "right") => {
    switch (align) {
      case "center":
        return "text-center";
      case "right":
        return "text-right";
      default:
        return "text-left";
    }
  };

  const renderTable = () => (
    <div className={`overflow-x-auto ${containerClassName}`}>
      <Table className={tableClassName}>
        <TableHeader>
          <TableRow
            className={
              headerRowClassName ||
              "bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200"
            }
          >
            {showSerialNumber && (
              <TableHead className="text-center font-semibold text-slate-700 text-xs uppercase tracking-wider py-4 bg-gradient-to-b from-slate-50 to-slate-100">
                {serialNumberHeader}
              </TableHead>
            )}
            {columns.map((column) => (
              <TableHead
                key={column.key}
                className={`${getAlignment(
                  column.align
                )} font-semibold text-slate-700 text-xs uppercase tracking-wider py-4 ${
                  column.width || ""
                } ${column.headerClassName || ""}`}
              >
                {column.header}
              </TableHead>
            ))}
            {actions && actions.length > 0 && (
              <TableHead className="text-center font-semibold text-slate-700 text-xs uppercase tracking-wider py-4">
                Actions
              </TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={
                  columns.length +
                  (showSerialNumber ? 1 : 0) +
                  (actions && actions.length > 0 ? 1 : 0)
                }
                className="text-center text-slate-500 py-12 font-medium"
              >
                <div className="flex flex-col items-center gap-2">
                  <div className="text-4xl">📋</div>
                  {emptyMessage}
                </div>
              </TableCell>
            </TableRow>
          ) : (
            data.map((item, index) => (
              <TableRow
                key={getKey(item, index)}
                className={getRowClassName(item, index)}
              >
                {showSerialNumber && (
                  <TableCell className="text-center text-slate-600 py-4 font-medium">
                    {index + 1}
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell
                    key={column.key}
                    className={`${getAlignment(column.align)} py-4 ${
                      column.cellClassName || ""
                    }`}
                  >
                    {column.render
                      ? column.render(item, index)
                      : column.accessor
                      ? column.accessor(item)
                      : ""}
                  </TableCell>
                ))}
                {actions && actions.length > 0 && (
                  <TableCell className="text-center py-4">
                    <div className="flex items-center justify-center gap-1">
                      {actions.map((action, actionIndex) => {
                        if (action.show && !action.show(item)) {
                          return null;
                        }

                        const ButtonComponent = () => (
                          <button
                            type="button"
                            onClick={() => action.onClick(item, index)}
                            className={`inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${
                              action.variant === "ghost"
                                ? "hover:bg-accent hover:text-accent-foreground"
                                : action.variant === "outline"
                                ? "border border-input hover:bg-accent hover:text-accent-foreground"
                                : action.variant === "destructive"
                                ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                : "bg-primary text-primary-foreground hover:bg-primary/90"
                            } ${
                              action.size === "sm"
                                ? "h-8 px-3 text-xs"
                                : action.size === "lg"
                                ? "h-11 px-8"
                                : action.size === "icon"
                                ? "h-9 w-9"
                                : "h-10 px-4 py-2"
                            } ${action.className || ""}`}
                          >
                            {action.icon && <action.icon className="h-4 w-4" />}
                            {action.label && (
                              <span className={action.icon ? "ml-2" : ""}>
                                {action.label}
                              </span>
                            )}
                          </button>
                        );

                        return <ButtonComponent key={actionIndex} />;
                      })}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  if (wrapInCard) {
    return <Card className="overflow-hidden">{renderTable()}</Card>;
  }

  return renderTable();
}
