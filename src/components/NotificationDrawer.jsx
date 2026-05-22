import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { markAllRead } from '../store/notificationSlice'

export function NotificationDrawer({ open, onClose }) {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const notifications = useSelector(s => s.notifications.items ?? [])
  const unread = notifications.filter(n => !n.read).length

  return (
    <>
      {/* Backdrop */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={onClose}
        />
      )}

      {/* Drawer panel */}
      <div className={`fixed top-0 right-0 bottom-0 z-50 w-[360px] max-w-[100vw] bg-[var(--paper)] border-l-[1.5px] border-[var(--ink)] flex flex-col transform transition-transform duration-200 ${open ? 'translate-x-0' : 'translate-x-full'}`}>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b-[1.5px] border-[var(--ink)]">
          <div>
            <div className="font-data text-[9px] uppercase tracking-widest text-[var(--ink-3)]">NOTIFICATIONS</div>
            <div className="font-brand text-[20px]">
              {unread > 0 ? `${unread} new` : 'All caught up'}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="font-data text-[11px] uppercase tracking-widest text-[var(--ink-3)] hover:text-[var(--ink)] bg-transparent border-none cursor-pointer transition-colors"
              onClick={() => dispatch(markAllRead())}
            >
              Mark all read
            </button>
            <button
              onClick={onClose}
              className="flex items-center justify-center w-8 h-8 border-[1.5px] border-[var(--ink-4)] hover:border-[var(--ink)] bg-transparent cursor-pointer transition-colors font-brand text-[18px]"
            >
              &#x2715;
            </button>
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 text-center px-6">
              <div className="font-brand text-[40px] opacity-20">&#x1F514;</div>
              <div className="font-body text-[15px] text-[var(--ink-3)]">No notifications yet</div>
            </div>
          ) : (
            notifications.map(n => (
              <div
                key={n.id}
                className={`flex items-start gap-3 px-5 py-4 border-b-[1.5px] border-[var(--ink-4)] transition-colors cursor-pointer hover:bg-[var(--paper-2)] ${!n.read ? 'bg-[var(--green-soft)]' : ''}`}
              >
                <div className={`w-9 h-9 shrink-0 flex items-center justify-center border-[1.5px] font-brand text-[18px] ${!n.read ? 'border-[var(--green-ink)] bg-[var(--green-soft)]' : 'border-[var(--ink-4)] bg-[var(--paper-2)]'}`}>
                  {n.type === 'new_order' ? '📦' : n.type === 'order_accepted' ? '✅' : n.type === 'order_rejected' ? '❌' : n.type === 'price_alert' ? '💰' : n.type === 'order_completed' ? '✅' : n.type === 'flagged_item' ? '⚠️' : '📢'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2">
                    <span className="font-body text-[14px] text-[var(--ink)] flex-1 leading-snug">{n.title ?? n.message ?? n.body}</span>
                    {!n.read && <span className="w-2 h-2 rounded-full bg-[var(--green-ink)] shrink-0 mt-1" />}
                  </div>
                  <div className="font-data text-[11px] text-[var(--ink-3)] mt-0.5">
                    {(n.created_at || n.createdAt) ? new Date(n.created_at ?? n.createdAt).toLocaleTimeString() : ''}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t-[1.5px] border-[var(--ink)] flex items-center justify-between">
          <span className="font-data text-[11px] text-[var(--ink-3)]">{notifications.length} total</span>
          <button
            onClick={() => { navigate('/notifications'); onClose() }}
            className="font-data text-[11px] uppercase tracking-widest text-[var(--green-ink)] bg-transparent border-none cursor-pointer hover:opacity-75 transition-opacity"
          >
            Settings &rarr;
          </button>
        </div>
      </div>
    </>
  )
}
