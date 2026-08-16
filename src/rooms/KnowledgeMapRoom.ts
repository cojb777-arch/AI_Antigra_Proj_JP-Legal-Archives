/* =========================================================
   🗺️ 2. KNOWLEDGE MAP ROOM (地図・目録室: 法令階層構造・全101法令書架)
   ========================================================= */

import { EgovApiService, LawDetail } from '../services/egov-api';
import { MASTER_LAWS_101, MasterLawItem } from '../data/master-laws';
import { SpeechService } from '../services/speech';
import { StorageService } from '../services/storage';

export class KnowledgeMapRoom {
  private container: HTMLElement;
  private currentLaw: LawDetail | null = null;
  private selectedCategory: string = 'all';
  private currentSearchQuery: string = '';

  constructor(containerId: string) {
    this.container = document.getElementById(containerId) as HTMLElement;
  }

  public async render(): Promise<void> {
    this.container.innerHTML = `
      <div class="room-header">
        <div class="room-title-group">
          <span class="room-tag">THE MAP & CATALOGUE ROOM</span>
          <h2 class="room-title">🗺️ 地図・目録室 <span style="font-size: 14px; font-weight: normal; color: var(--color-brass-dark);">〜 収載101法令書架 ＆ 法令階層構造 〜</span></h2>
          <p class="room-desc">日本法体系ピラミッド（憲法 ➔ 法律 ➔ 政令 ➔ 省令 ➔ 条例）と、六法・重要法令全101選をワンクリックで自在に閲覧・探索できます。</p>
        </div>
      </div>

      <!-- 日本法令の階層構造ピラミッド（Hierarchy Pyramid Banner） -->
      <div class="law-hierarchy-pyramid">
        <div class="hierarchy-header">
          <div class="hierarchy-title">
            <span>🏛️ 日本国 法令階層構造ピラミッド</span>
            <span style="font-size: 11px; color: #D6CCA8; font-weight: normal;">（上位法優位の原則：下位の法規は上位の法規に反することができない）</span>
          </div>
          <button id="btn-show-all-laws" class="btn-outline-classic" style="padding: 2px 8px; font-size: 11px; background: rgba(0,0,0,0.3); color: #FFF; border-color: rgba(197,160,89,0.4);">
            全階層を表示
          </button>
        </div>

        <div class="hierarchy-steps">
          <!-- 1. 憲法 -->
          <div class="hierarchy-tier-card" data-tier="憲法" data-query="日本国憲法">
            <span class="tier-badge">TIER 1 (最高法規)</span>
            <span class="tier-name">📜 憲法</span>
            <span class="tier-desc">国家の根本規範・人権保障<br>（日本国憲法）</span>
          </div>

          <!-- 2. 法律 -->
          <div class="hierarchy-tier-card active" data-tier="法律" data-query="民法">
            <span class="tier-badge">TIER 2 (国会制定)</span>
            <span class="tier-name">⚖️ 法律</span>
            <span class="tier-desc">国会が制定する基本法規<br>（民法・刑法・会社法等）</span>
          </div>

          <!-- 3. 政令（施行令） -->
          <div class="hierarchy-tier-card" data-tier="政令" data-query="労働基準法施行令">
            <span class="tier-badge">TIER 3 (内閣制定)</span>
            <span class="tier-name">🏢 政令（施行令）</span>
            <span class="tier-desc">法律を執行するための命令<br>（〇〇法施行令等）</span>
          </div>

          <!-- 4. 省令（施行規則） -->
          <div class="hierarchy-tier-card" data-tier="省令" data-query="労働基準法施行規則">
            <span class="tier-badge">TIER 4 (各省大臣)</span>
            <span class="tier-name">📑 省令（施行規則）</span>
            <span class="tier-desc">手続・詳細基準を定める<br>（〇〇法施行規則等）</span>
          </div>

          <!-- 5. 条例・規則 -->
          <div class="hierarchy-tier-card" data-tier="条例">
            <span class="tier-badge">TIER 5 (地方自治体)</span>
            <span class="tier-name">🏙️ 条例・規則</span>
            <span class="tier-desc">地方自治体が制定する自主法<br>（東京都迷惑防止条例等）</span>
          </div>
        </div>
      </div>

      <div class="map-layout">
        <!-- 左側：101収載法令 書架ナビゲーション -->
        <aside class="map-sidebar">
          <div class="law-search-box parchment-card">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <span class="preset-laws-title" style="margin-top: 0;">🏛️ 収載法令書架 (全101法令)</span>
              <span id="master-laws-count" style="font-size: 11px; color: var(--text-sepia); font-weight: bold;">101件</span>
            </div>

            <!-- 検索バー -->
            <div class="search-bar-classic" style="margin-top: 4px;">
              <input type="text" id="map-law-search-input" placeholder="法令名・番号で絞り込み (例: 憲法, 労基法, 77)...">
              <button id="btn-map-search-law" class="btn-royal-gold" style="padding: 4px 10px; font-size: 12px;">探索</button>
            </div>

            <!-- カテゴリタブ -->
            <div class="master-law-category-tabs">
              <button class="btn-cat-tab active" data-cat="all">すべて(101)</button>
              <button class="btn-cat-tab" data-cat="公法・憲法">公法・憲法</button>
              <button class="btn-cat-tab" data-cat="行政・社会">行政・社会</button>
              <button class="btn-cat-tab" data-cat="民法・民事">民法・民事</button>
              <button class="btn-cat-tab" data-cat="商法・会社">商法・会社</button>
              <button class="btn-cat-tab" data-cat="刑事法">刑事法</button>
              <button class="btn-cat-tab" data-cat="労働・知財">労働・知財</button>
              <button class="btn-cat-tab" data-cat="国際条約">国際条約</button>
            </div>

            <!-- 101法令ボタン書架グリッド -->
            <div class="master-laws-scroll-grid" id="master-laws-grid"></div>
          </div>

          <!-- 目次・条文一覧 -->
          <div class="law-toc-container" id="law-toc-list">
            <p style="font-size: 12px; color: var(--text-muted); text-align: center; padding: 20px;">
              法令を選択すると、章・条文の目録が表示されます。
            </p>
          </div>
        </aside>

        <!-- 右側：条文本文・詳細ビュー -->
        <section class="map-content-view" id="map-article-view">
          <div style="text-align: center; padding: 60px 20px; color: var(--text-muted);">
            <span style="font-size: 48px; display: block; margin-bottom: 12px;">🏛️</span>
            <p style="font-size: 16px; font-weight: 700; color: var(--color-oxford-blue);">法令の条文データを開いてください</p>
            <p style="font-size: 13px;">左の書架から101法令を選択するか、上の階層ピラミッドをクリックしてください。</p>
          </div>
        </section>
      </div>
    `;

    this.attachEvents();
    this.renderMasterLawsGrid();
    // 初期表示で「日本国憲法 (No.2)」をロード
    await this.loadLawByName("日本国憲法", 2);
  }

  private attachEvents(): void {
    const searchInput = document.getElementById('map-law-search-input') as HTMLInputElement;
    const searchBtn = document.getElementById('btn-map-search-law');

    // 検索入力によるインクリメンタル絞り込み
    searchInput?.addEventListener('input', () => {
      this.currentSearchQuery = searchInput.value.trim().toLowerCase();
      this.renderMasterLawsGrid();
    });

    searchBtn?.addEventListener('click', async () => {
      const q = searchInput.value.trim();
      if (q) {
        await this.loadLawByName(q);
      }
    });

    searchInput?.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter') {
        const q = searchInput.value.trim();
        if (q) await this.loadLawByName(q);
      }
    });

    // カテゴリタブ切り替え
    this.container.querySelectorAll('.btn-cat-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-cat') || 'all';
        this.selectedCategory = cat;
        this.container.querySelectorAll('.btn-cat-tab').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.renderMasterLawsGrid();
      });
    });

    // 階層ピラミッドカードクリックイベント
    this.container.querySelectorAll('.hierarchy-tier-card').forEach(card => {
      card.addEventListener('click', async () => {
        const query = card.getAttribute('data-query');
        const tier = card.getAttribute('data-tier') || 'all';

        this.container.querySelectorAll('.hierarchy-tier-card').forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        if (query) {
          await this.loadLawByName(query);
        } else if (tier === '条例') {
          alert('🏛️ 条例・地方規則は各自治体の例規集またはe-Gov法令APIを通じて照会可能です。検索窓にキーワードをご入力ください。');
        }
      });
    });

    document.getElementById('btn-show-all-laws')?.addEventListener('click', () => {
      this.selectedCategory = 'all';
      this.container.querySelectorAll('.btn-cat-tab').forEach(b => b.classList.toggle('active', b.getAttribute('data-cat') === 'all'));
      this.container.querySelectorAll('.hierarchy-tier-card').forEach(c => c.classList.remove('active'));
      this.renderMasterLawsGrid();
    });
  }

  private renderMasterLawsGrid(): void {
    const gridEl = document.getElementById('master-laws-grid');
    const countEl = document.getElementById('master-laws-count');
    if (!gridEl) return;

    let filtered = MASTER_LAWS_101;

    // カテゴリフィルター
    if (this.selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category === this.selectedCategory);
    }

    // 検索語フィルター
    if (this.currentSearchQuery) {
      filtered = filtered.filter(item => 
        item.title.toLowerCase().includes(this.currentSearchQuery) ||
        item.query.toLowerCase().includes(this.currentSearchQuery) ||
        item.no.toString() === this.currentSearchQuery
      );
    }

    if (countEl) countEl.textContent = `${filtered.length}件`;

    if (filtered.length === 0) {
      gridEl.innerHTML = `<div style="grid-column: span 2; font-size: 12px; color: var(--text-muted); padding: 12px; text-align: center;">該当する法令がございません</div>`;
      return;
    }

    gridEl.innerHTML = filtered.map(law => `
      <button class="btn-master-law ${this.currentLaw?.lawTitle === law.title ? 'active' : ''}" data-no="${law.no}" data-query="${law.query}" data-title="${law.title}" title="${law.no}. ${law.title} (${law.type})">
        <span class="law-no">${law.no}.</span>
        <span>${law.title}</span>
      </button>
    `).join('');

    gridEl.querySelectorAll('.btn-master-law').forEach(btn => {
      btn.addEventListener('click', async () => {
        const query = btn.getAttribute('data-query') || '';
        const no = parseInt(btn.getAttribute('data-no') || '0', 10);
        const title = btn.getAttribute('data-title') || query;

        gridEl.querySelectorAll('.btn-master-law').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        await this.loadLawByName(query, no, title);
      });
    });
  }

  public async loadLawByName(queryOrTitle: string, lawNo?: number, displayTitle?: string, targetArticleNum?: string): Promise<void> {
    const viewEl = document.getElementById('map-article-view');
    const tocEl = document.getElementById('law-toc-list');
    if (!viewEl || !tocEl) return;

    const showTitle = displayTitle || queryOrTitle;

    viewEl.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--color-brass-dark);">
        <span style="font-size: 36px; display: block; margin-bottom: 12px;">📜</span>
        <p style="font-size: 16px; font-weight: 700; color: var(--color-oxford-blue);">書架より法令「${showTitle}」を取り出し、条文データを読み込み中...</p>
        <p style="font-size: 13px; color: var(--text-sepia); margin-top: 4px;">e-Gov法令API v2と通信しております。</p>
      </div>
    `;

    try {
      // 1. e-Gov APIで検索してLawIdを特定
      const searchResults = await EgovApiService.searchLaws(queryOrTitle);
      let targetLawId = '';
      if (searchResults.length > 0) {
        targetLawId = searchResults[0].LawId;
      }

      // 2. 本文データ取得
      const law = targetLawId ? await EgovApiService.getLawDetail(targetLawId) : EgovApiService.getMockLawDetail(queryOrTitle);
      if (displayTitle) law.lawTitle = displayTitle;
      this.currentLaw = law;

      // 目次を更新
      tocEl.innerHTML = `
        <div style="font-size: 12px; font-weight: 700; color: var(--color-oxford-blue); margin-bottom: 8px; border-bottom: 1px solid var(--border-antique); padding-bottom: 4px; display: flex; justify-content: space-between;">
          <span>条文索引 (${law.articles.length}ヶ条)</span>
          ${lawNo ? `<span style="font-family: var(--font-mono); color: var(--color-brass-dark);">No.${lawNo}</span>` : ''}
        </div>
        ${law.articles.map(art => `
          <div class="toc-item" data-target="art-${encodeURIComponent(art.num)}">
            <span style="font-weight: 600;">${art.num}</span>
            <span style="font-size: 11px; color: var(--text-muted);">${art.caption || ''}</span>
          </div>
        `).join('')}
      `;

      // 目次クリックイベント
      tocEl.querySelectorAll('.toc-item').forEach(item => {
        item.addEventListener('click', () => {
          const targetId = item.getAttribute('data-target');
          if (targetId) {
            const el = document.getElementById(targetId);
            el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            el?.classList.add('highlight-flash');
            setTimeout(() => el?.classList.remove('highlight-flash'), 2000);
          }
        });
      });

      // 本文描画
      viewEl.innerHTML = `
        <div class="law-meta-banner">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              ${lawNo ? `<span class="badge-v2" style="background: var(--color-oxford-blue);">No.${lawNo}</span>` : ''}
              <span class="badge-law-type law">${law.lawType}</span>
            </div>
            <h3 class="law-meta-title" style="margin-top: 4px;">${law.lawTitle}</h3>
            <div class="law-meta-num">${law.lawNum || ''}</div>
          </div>
          <button id="btn-read-all-law" class="btn-royal-gold" style="font-size: 12px; padding: 6px 14px;">
            🔊 全文を素読
          </button>
        </div>

        <div class="articles-stack">
          ${law.articles.map(art => `
            <div class="article-card" id="art-${encodeURIComponent(art.num)}">
              <div class="article-num">
                <span>
                  📜 ${art.num}
                  ${art.caption ? `<span class="article-caption">${art.caption}</span>` : ''}
                </span>
                <button class="btn-outline-classic btn-sm btn-bookmark-art" data-num="${art.num}" data-text="${encodeURIComponent(art.body)}" title="栞（ブックマーク）に挟む">
                  🔖 栞
                </button>
              </div>
              <div class="article-body">
                ${art.body.split('\n').map(line => `<p style="margin-bottom: 4px;">${line}</p>`).join('')}
              </div>
              <div class="article-actions">
                <button class="btn-outline-classic btn-sm btn-speak-single" data-num="${art.num}" data-text="${encodeURIComponent(art.body)}" style="font-size: 11px;">
                  🔊 素読
                </button>
                <button class="btn-outline-classic btn-sm btn-copy-art" data-text="${encodeURIComponent(law.lawTitle + ' ' + art.num + ' ' + art.body)}" style="font-size: 11px;">
                  📋 複写
                </button>
              </div>
            </div>
          `).join('')}
        </div>
      `;

      // アクションイベントのバインド
      this.attachArticleActions(law);

      // 特定条文へのジャンプ指定がある場合
      if (targetArticleNum) {
        setTimeout(() => {
          const targetEl = document.getElementById(`art-${encodeURIComponent(targetArticleNum)}`);
          if (targetEl) {
            targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetEl.style.borderLeftColor = 'var(--color-sealing-wax)';
            targetEl.style.boxShadow = '0 0 15px rgba(142, 35, 35, 0.4)';
            setTimeout(() => {
              targetEl.style.borderLeftColor = '';
              targetEl.style.boxShadow = '';
            }, 3000);
          }
        }, 300);
      }

    } catch (err: any) {
      viewEl.innerHTML = `<div style="color: var(--color-crimson); padding: 20px;">条文の取得に失敗しました: ${err.message}</div>`;
    }
  }

  // 後方互換用
  public async loadLaw(lawId: string, targetArticleNum?: string, lawTitleHint?: string): Promise<void> {
    await this.loadLawByName(lawTitleHint || lawId, undefined, lawTitleHint, targetArticleNum);
  }

  private attachArticleActions(law: LawDetail): void {
    // 全文朗読
    document.getElementById('btn-read-all-law')?.addEventListener('click', () => {
      const fullText = law.articles.slice(0, 5).map(a => `${a.num}。${a.body}`).join('。\n');
      SpeechService.speak(fullText, `${law.lawTitle} を素読中`);
    });

    // 単一条文朗読
    this.container.querySelectorAll('.btn-speak-single').forEach(btn => {
      btn.addEventListener('click', () => {
        const text = decodeURIComponent(btn.getAttribute('data-text') || '');
        const num = btn.getAttribute('data-num') || '';
        SpeechService.speak(text, `${law.lawTitle} ${num}`);
      });
    });

    // 栞（ブックマーク）
    this.container.querySelectorAll('.btn-bookmark-art').forEach(btn => {
      btn.addEventListener('click', () => {
        const num = btn.getAttribute('data-num') || '';
        const text = decodeURIComponent(btn.getAttribute('data-text') || '');
        StorageService.addBookmark({
          lawId: law.lawId,
          lawTitle: law.lawTitle,
          articleNum: num,
          articleText: text
        });
        alert(`🔖 ${law.lawTitle} ${num} を栞（ブックマーク）に保存いたしました。`);
      });
    });

    // 複写（コピー）
    this.container.querySelectorAll('.btn-copy-art').forEach(btn => {
      btn.addEventListener('click', async () => {
        const text = decodeURIComponent(btn.getAttribute('data-text') || '');
        await navigator.clipboard.writeText(text);
        alert('📋 条文をクリップボードに複写いたしました。');
      });
    });
  }
}
