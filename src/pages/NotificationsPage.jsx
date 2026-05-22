import { useSelector, useDispatch } from 'react-redux'
import { useT } from '../hooks/useT'
import { Card } from '../components/Card'
import { Button } from '../components/Button'
import { SectionDivider } from '../components/SectionDivider'
import { markRead, markAllRead, dismiss, selectUnreadCount } from '../store/notificationSlice'
import { useNotificationActions } from '../hooks/useNotificationActions'

const TYPE_ICON = {
  new_order:       '📦',
  order_accepted:  '✅',
  order_rejected:  '❌',
  price_alert:     '📈',
  order_completed: '✅',
  flagged_item:    '🚩',
  system:          '🔔',
}

function formatTime(iso) {
  const d = new Date(iso)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function NotifCard({ item, onRead, onDismiss }) {
  const isFlagged = item.type === 'flagged_item'
  return (
    <Card
      className={`relative flex flex-col gap-1 cursor-pointer ${isFlagged && !item.read ? 'flagged-pulse' : ''}`}
      onClick={() => onRead(item.id)}
      style={isFlagged
        ? { borderLeft: '3px solid var(--orange)' }
        : { borderLeft: item.read ? '3px solid transparent' : '3px solid var(--green)' }
      }
    >
      <button
        type="button"
        onClick={e => { e.stopPropagation(); onDismiss(item.id) }}
        className="absolute top-3 right-3 font-body text-[16px] text-[var(--ink-3)] hover:text-[var(--ink)] bg-transparent border-none cursor-pointer p-0 leading-none"
        aria-label="dismiss"
      >
        ×
      </button>

      <div className="flex items-center gap-2">
        <span className="text-[18px] leading-none">{TYPE_ICON[item.type] ?? '🔔'}</span>
        <span
          className={[
            'font-body text-[14px] text-[var(--ink)]',
            item.read ? '' : 'font-semibold',
          ].join(' ')}
        >
          {item.title}
        </span>
      </div>

      <p className="font-body text-[13px] m-0 pr-6" style={{ color: 'var(--ink-3)' }}>
        {item.body}
      </p>

      <span className="font-data text-[10px]" style={{ color: 'var(--ink-4)' }}>
        {formatTime(item.createdAt)}
      </span>
    </Card>
  )
}

export function NotificationsPage() {
  const t        = useT()
  const dispatch = useDispatch()
  const session  = useSelector(s => s.user.session)
  const items    = useSelector(s => s.notifications.items)
  const unread   = useSelector(selectUnreadCount)

  const notifActions = useNotificationActions()

  async function handleRead(id) {
    dispatch(markRead(id))
    await notifActions.markRead(id)
  }

  async function handleDismiss(id) {
    dispatch(dismiss(id))
    await notifActions.dismissNotification(id)
  }

  async function handleMarkAllRead() {
    dispatch(markAllRead())
    await notifActions.markAllRead(session?.user?.id)
  }

  const TODAY   = new Date().toISOString().slice(0, 10)
  const today   = items.filter(n => n.createdAt?.startsWith(TODAY))
  const earlier = items.filter(n => !n.createdAt?.startsWith(TODAY))

  return (
    <main className="px-4 py-8 flex flex-col gap-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-brand text-[28px] text-[var(--ink)] m-0">{t.notificationsTitle}</h1>
          {unread > 0 && (
            <span
              className="font-data text-[11px] px-2 py-0.5 rounded-full"
              style={{ background: 'var(--green)', color: '#062040' }}
            >
              {unread} {t.unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <Button variant="secondary" onClick={handleMarkAllRead}>
            {t.markAllRead}
          </Button>
        )}
      </div>

      {items.length === 0 && (
        <p className="font-body text-[14px] text-[var(--ink-3)]">{t.noNotifications}</p>
      )}

      {today.length > 0 && (
        <div className="flex flex-col gap-3">
          <SectionDivider label={t.notifToday} />
          {today.map(n => (
            <NotifCard key={n.id} item={n} onRead={handleRead} onDismiss={handleDismiss} />
          ))}
        </div>
      )}

      {earlier.length > 0 && (
        <div className="flex flex-col gap-3">
          <SectionDivider label={t.notifEarlier} />
          {earlier.map(n => (
            <NotifCard key={n.id} item={n} onRead={handleRead} onDismiss={handleDismiss} />
          ))}
        </div>
      )}
    </main>
  )
}
