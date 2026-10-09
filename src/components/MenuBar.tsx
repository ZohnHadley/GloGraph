import { useEffect, useRef, useState } from 'react';

interface MenuAction {
  label: string;
  shortcut?: string;
  disabled?: boolean;
  action?: () => void;
  icon?: React.ReactNode;
}
interface MenuSep { sep: true }
type MenuItem = MenuAction | MenuSep;

export interface MenuGroup {
  label: string;
  items: MenuItem[];
}

interface MenuBarProps {
  menus: MenuGroup[];
  quickActions?: React.ReactNode;
  stat?: string;
}

export default function MenuBar({ menus, quickActions, stat }: MenuBarProps) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onMouseDown(e: MouseEvent) {
      if (barRef.current && !barRef.current.contains(e.target as Node)) {
        setOpenIdx(null);
      }
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpenIdx(null);
    }
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, []);

  function toggleMenu(i: number) {
    setOpenIdx(prev => (prev === i ? null : i));
  }

  function activateItem(item: MenuAction) {
    item.action?.();
    setOpenIdx(null);
  }

  return (
    <div className="menubar" ref={barRef}>
      {menus.map((menu, i) => (
        <div
          key={menu.label}
          className={`menubar__menu${openIdx === i ? ' menubar__menu--open' : ''}`}
          onMouseDown={() => toggleMenu(i)}
          onMouseEnter={() => openIdx !== null && openIdx !== i && setOpenIdx(i)}
        >
          {menu.label}

          {openIdx === i && (
            <div className="menu-dropdown" onMouseDown={e => e.stopPropagation()}>
              {menu.items.map((item, j) =>
                'sep' in item ? (
                  <div key={j} className="menu-dropdown__sep" />
                ) : (
                  <button
                    key={j}
                    className="menu-dropdown__item"
                    disabled={item.disabled || !item.action}
                    onMouseDown={() => !item.disabled && item.action && activateItem(item)}
                  >
                    <span className="menu-dropdown__label">
                      <span className="menu-dropdown__icon">{item.icon}</span>
                      {item.label}
                    </span>
                    {item.shortcut && (
                      <span className="menu-dropdown__shortcut">{item.shortcut}</span>
                    )}
                  </button>
                )
              )}
            </div>
          )}
        </div>
      ))}

      {quickActions && (
        <>
          <div className="menubar__sep" />
          {quickActions}
        </>
      )}

      {stat && <span className="menubar__stat">{stat}</span>}
    </div>
  );
}
