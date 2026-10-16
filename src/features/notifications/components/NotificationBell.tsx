"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Dropdown } from "react-bootstrap";
import { useFormatter, useNow, useTranslations } from "next-intl";
import { FaBell, FaChartBar, FaClipboardCheck, FaPenToSquare } from "react-icons/fa6";
import type { IconType } from "react-icons";
import type { NotificationItem, NotificationList, NotificationType } from "../notificationTypes";
import styles from "./NotificationBell.module.css";

// Sin tiempo real: se consulta al abrir el panel, al volver a la pestaña y cada minuto.
const REFRESH_MS = 60_000;

const TYPE_ICONS: Record<NotificationType, IconType> = {
  review_pending: FaPenToSquare,
  evaluation_pending: FaClipboardCheck,
  session_summary: FaChartBar,
};

// Valores por defecto: un aviso con datos incompletos no debe romper la lista.
const DEFAULT_VALUES = { activity: "", count: 0, participants: 0, average: 0, badges: 0 };

const EMPTY: NotificationList = { items: [], unread: 0 };

export default function NotificationBell() {
  const t = useTranslations("Notifications");
  const format = useFormatter();
  // La campana queda abierta mucho tiempo: "hace 5 minutos" se actualiza solo.
  const now = useNow({ updateInterval: REFRESH_MS });
  const router = useRouter();
  const [list, setList] = useState<NotificationList>(EMPTY);

  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/notifications", { cache: "no-store" });
      if (response.ok) setList(await response.json());
    } catch {
      // Sin conexión se conserva la última lista; se reintenta en el siguiente ciclo.
    }
  }, []);

  const markRead = useCallback(async (body: { ids: string[] } | { all: true }) => {
    try {
      const response = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (response.ok) setList(await response.json());
    } catch {
      // Marcar como leída es secundario: si falla, el aviso sigue sin leer.
    }
  }, []);

  useEffect(() => {
    refresh();
    const onVisible = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const timer = window.setInterval(() => {
      if (document.visibilityState === "visible") refresh();
    }, REFRESH_MS);
    document.addEventListener("visibilitychange", onVisible);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisible);
    };
  }, [refresh]);

  const open = (item: NotificationItem) => {
    if (!item.read) markRead({ ids: [item.id] });
    if (item.link) router.push(item.link);
  };

  const label = list.unread > 0 ? t("bellUnread", { count: list.unread }) : t("bell");

  return (
    <Dropdown align="end" onToggle={(show) => show && refresh()}>
      <Dropdown.Toggle as="button" type="button" className={styles.toggle} aria-label={label} title={label} bsPrefix="ludi-bell">
        <FaBell aria-hidden="true" />
        {list.unread > 0 && (
          <span className={styles.badge} aria-hidden="true">
            {list.unread > 9 ? "9+" : list.unread}
          </span>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu className={styles.menu}>
        <div className={styles.header}>
          <h2 className={styles.title}>{t("title")}</h2>
          {list.unread > 0 && (
            <button type="button" className={styles.markAll} onClick={() => markRead({ all: true })}>
              {t("markAll")}
            </button>
          )}
        </div>

        {list.items.length === 0 ? (
          <p className={styles.empty}>{t("empty")}</p>
        ) : (
          <ul className={styles.list}>
            {list.items.map((item) => {
              const Icon = TYPE_ICONS[item.type] ?? FaBell;
              const values = { ...DEFAULT_VALUES, ...item.data };
              return (
                <li key={item.id}>
                  <Dropdown.Item
                    as="button"
                    type="button"
                    className={`${styles.item} ${item.read ? "" : styles.unread}`}
                    onClick={() => open(item)}
                  >
                    <span className={`${styles.icon} ${styles[item.type] ?? ""}`} aria-hidden="true">
                      <Icon />
                    </span>
                    <span className={styles.body}>
                      <span className={styles.itemTitle}>
                        {t(`types.${item.type}.title`)}
                        {!item.read && <span className="visually-hidden">{t("unreadMark")}</span>}
                      </span>
                      <span className={styles.itemText}>{t(`types.${item.type}.body`, values)}</span>
                      <span className={styles.time}>{format.relativeTime(new Date(item.updatedAt), now)}</span>
                    </span>
                  </Dropdown.Item>
                </li>
              );
            })}
          </ul>
        )}

        <div className={styles.footer}>
          <Link href="/settings/preferences" className={styles.settingsLink}>
            {t("settingsLink")}
          </Link>
        </div>
      </Dropdown.Menu>
    </Dropdown>
  );
}
