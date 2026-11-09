(() => {
  if (window.__svDesign) return;
  window.__svDesign = true;
  const main = document.querySelector('main');
  if (main) {
    if (!main.id) main.id = 'sv-main';
    main.tabIndex = -1;
    const skip = document.createElement('a');
    skip.href = '#' + main.id; skip.className = 'sv-skip'; skip.textContent = '본문으로 바로가기';
    document.body.prepend(skip);
  }
  const path = location.pathname.replace(/\/$/, '') || '/';
  document.querySelectorAll('header nav a, [data-mobile-menu] a').forEach(a => {
    const target = new URL(a.href).pathname.replace(/\/$/, '');
    if (path === target || path.startsWith(target + '/')) a.setAttribute('aria-current', 'page');
  });
  const menu = document.querySelector('[data-menu-toggle]');
  if (menu) {
    const syncMenu = () => menu.setAttribute('aria-label', menu.getAttribute('aria-expanded') === 'true' ? '메뉴 닫기' : '메뉴 열기');
    new MutationObserver(syncMenu).observe(menu, {attributes:true,attributeFilter:['aria-expanded']}); syncMenu();
  }
  document.querySelector('header a[aria-label="Search"]')?.setAttribute('aria-label', '전체 글 검색');
  const root = document.querySelector('[data-note-modal-root]');
  const close = root?.querySelector('button[data-note-modal-close]');
  close?.setAttribute('aria-label', '글 닫기');
  root?.querySelector('[role=dialog]')?.setAttribute('aria-label', '글 읽기');
  let restoreFocus = null;
  let inertBefore = [];
  if (root) {
    const sync = () => {
      const open = root.getAttribute('aria-hidden') === 'false';
      if (open) {
        restoreFocus = document.activeElement;
        inertBefore = [...root.parentElement.children].filter(e => e !== root).map(e => [e, e.inert]);
        inertBefore.forEach(([e]) => e.inert = true);
        close?.focus({preventScroll:true});
      } else {
        inertBefore.forEach(([e, inert]) => e.inert = inert); inertBefore = [];
        if (restoreFocus instanceof HTMLElement && restoreFocus.isConnected) restoreFocus.focus({preventScroll:true});
        restoreFocus = null;
      }
    };
    new MutationObserver(sync).observe(root, {attributes:true,attributeFilter:['aria-hidden']});
  }
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menu?.getAttribute('aria-expanded') === 'true') {menu.click();menu.focus();}
    if (event.key !== 'Tab' || root?.getAttribute('aria-hidden') !== 'false') return;
    const items = [...root.querySelectorAll('a[href],button,input,select,textarea,[tabindex="0"]')].filter(e => !e.disabled && e.getClientRects().length);
    const first = items[0], last = items.at(-1);
    if (event.shiftKey && (document.activeElement === first || !root.contains(document.activeElement))) {event.preventDefault();last?.focus();}
    else if (!event.shiftKey && (document.activeElement === last || !root.contains(document.activeElement))) {event.preventDefault();first?.focus();}
  }, true);
  const status = document.createElement('div'); status.className = 'sv-status';status.role = 'status';status.hidden = true;document.body.append(status);
  let timer;
  const notify = text => {clearTimeout(timer);status.textContent=text;status.hidden=false;timer=setTimeout(()=>status.hidden=true,2400);};
  document.addEventListener('click', async event => {
    const button = event.target.closest?.('[data-copy-color],[data-copy-text]');
    if (!button) return;
    event.preventDefault();event.stopImmediatePropagation();
    const text = button.dataset.copyColor || button.dataset.copyText;
    if (!text) return;
    try {await navigator.clipboard.writeText(text);notify('클립보드에 복사했습니다.');}
    catch {notify('복사하지 못했습니다. 텍스트를 선택해 직접 복사해주세요.');}
  }, true);
  const results = document.querySelector('#search-results');
  if (results) {
    const label = document.querySelector('label:has(#search-input)>span'); if(label) label.textContent='전체 글 검색';
    const summary=document.createElement('p');summary.className='mt-4 text-sm text-muted';summary.role='status';results.before(summary);
    const update=()=>{const count=results.querySelectorAll('a').length;summary.textContent=count?`${count}개의 글을 표시합니다.`:'검색 결과가 없습니다. 다른 단어로 검색해보세요.';};
    new MutationObserver(update).observe(results,{childList:true});update();
  }
})();
