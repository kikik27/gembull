"use client";

import { useEffect, useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { tableFeatures, useTable, type ColumnDef } from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { SectionHead } from "./section-head";
import { Reveal } from "./reveal";
import { epochJumpSchema, type HistoryRow } from "@/schemas/ritual";
import { formatRitl } from "@/lib/ritual-format";

const features = tableFeatures({});
type JumpForm = { day: number };

type Props = {
  rows: HistoryRow[];
  lastDay: number | null | undefined;
  historyLimit: number;
  rewardPerCheckin?: string;
  busy: boolean;
  explorer: string;
  loading: boolean;
  onClaim: (dayId: number) => void;
  onShowOlder: () => void;
  onJumpToDay: (dayId: number) => void;
};

export function HistorySection({
  rows,
  lastDay,
  historyLimit,
  rewardPerCheckin,
  busy,
  explorer,
  loading,
  onClaim,
  onShowOlder,
  onJumpToDay,
}: Props) {
  const [highlightDay, setHighlightDay] = useState<number | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<JumpForm>({
    resolver: zodResolver(epochJumpSchema),
    defaultValues: { day: 0 },
  });
  const columns = useMemo<Array<ColumnDef<typeof features, HistoryRow>>>(
    () => [
      {
        accessorKey: "day_id",
        header: "Day",
        cell: (info) => `#${info.getValue<number>()}`,
      },
      {
        accessorKey: "status",
        header: "Outcome",
        cell: (info) => (
          <span className={`outcome ${info.row.original.status.toLowerCase()}`}>
            {info.getValue<string>()}
          </span>
        ),
      },
      {
        accessorKey: "checkin_count",
        header: "Check-ins",
        cell: (info) =>
          `${info.row.original.checkin_count} / ${info.row.original.target}`,
      },
      {
        accessorKey: "treasury_burned",
        header: "Burned",
        cell: (info) => `${formatRitl(info.getValue<string>())} GEMBULL`,
      },
      {
        id: "reward",
        header: "Your reward",
        cell: (info) => {
          const row = info.row.original;
          return row.account?.reward_claimable ? (
            <Button
              className="claim-button"
              disabled={busy}
              onClick={() => onClaim(row.day_id)}
            >
              Claim {formatRitl(rewardPerCheckin)} ↗
            </Button>
          ) : row.account?.claimed ? (
            "Claimed ✓"
          ) : (
            "—"
          );
        },
      },
    ],
    [busy, onClaim, rewardPerCheckin],
  );
  const table = useTable({
    key: "ritual-history",
    features,
    columns,
    data: rows,
  });

  useEffect(() => {
    if (
      highlightDay !== null &&
      rows.some((row) => row.day_id === highlightDay)
    ) {
      document
        .getElementById(`epoch-${highlightDay}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }
  }, [highlightDay, rows]);

  const jumpToDay = ({ day }: JumpForm) => {
    if (lastDay == null || day > lastDay) return;
    setHighlightDay(day);
    if (rows.some((row) => row.day_id === day))
      document
        .getElementById(`epoch-${day}`)
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    onJumpToDay(day);
  };

  return (
    <section className="section" id="history" aria-labelledby="history-title">
      <div className="frame">
        <SectionHead
          title={<span id="history-title">Proof in the pattern.</span>}
          aside="Every finalized epoch, read from contract views. Claims appear on the row where you earned them."
        />
        <Reveal className="ledger">
          <div className="ledger-scroll">
            <Table>
              <TableHeader>
                {table.getHeaderGroups().map((group) => (
                  <TableRow key={group.id}>
                    {group.headers.map((header) => (
                      <TableHead key={header.id}>
                        {header.isPlaceholder ? null : (
                          <table.FlexRender header={header} />
                        )}
                      </TableHead>
                    ))}
                  </TableRow>
                ))}
              </TableHeader>
              <TableBody>
                {table.getRowModel().rows.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="empty-row">
                      {loading
                        ? "Loading finalized epochs…"
                        : "No finalized epochs yet. Once a configured contract finalizes its first day, it shows up here."}
                    </TableCell>
                  </TableRow>
                ) : (
                  table.getRowModel().rows.map((row) => (
                    <TableRow
                      key={row.id}
                      id={`epoch-${row.original.day_id}`}
                      data-highlight={highlightDay === row.original.day_id}
                    >
                      {row.getAllCells().map((cell) => (
                        <TableCell key={cell.id}>
                          <table.FlexRender cell={cell} />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          <div className="ledger-foot">
            <span>
              Mint, burn and check-in event logs live in NEAR transaction
              receipts.
            </span>
            {(lastDay ?? -1) + 1 > historyLimit && (
              <Button className="btn btn-quiet btn-sm" onClick={onShowOlder}>
                Load older epochs ↓
              </Button>
            )}
            <form className="epoch-jump" onSubmit={handleSubmit(jumpToDay)}>
              <label htmlFor="epoch-day">Find day</label>
              <Input
                id="epoch-day"
                type="number"
                min={0}
                max={lastDay ?? 0}
                aria-invalid={Boolean(errors.day)}
                {...register("day", { valueAsNumber: true })}
              />
              <Button type="submit">Go</Button>
              {errors.day && <span role="alert">Enter a valid day</span>}
            </form>
            {explorer && (
              <a href={explorer} target="_blank" rel="noreferrer">
                Open contract explorer ↗
              </a>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
