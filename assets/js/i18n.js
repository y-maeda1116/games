// 多言語対応システム (i18n)
class I18n {
    constructor() {
        this.currentLanguage = this.getStoredLanguage() || this.detectLanguage();
        this.translations = {};
        this.fallbackLanguage = 'en';
    }

    // ブラウザの言語を検出
    detectLanguage() {
        const browserLang = navigator.language || navigator.userLanguage;
        const langCode = browserLang.split('-')[0];
        
        // サポートされている言語かチェック
        const supportedLanguages = ['en', 'ja'];
        return supportedLanguages.includes(langCode) ? langCode : 'en';
    }

    // 保存された言語設定を取得
    getStoredLanguage() {
        return localStorage.getItem('gameLanguage');
    }

    // 言語設定を保存
    setStoredLanguage(lang) {
        localStorage.setItem('gameLanguage', lang);
    }

    // 翻訳ファイルを読み込み
    async loadTranslations(lang) {
        if (this.translations[lang]) {
            return this.translations[lang];
        }

        try {
            // 相対パスを使用してiOS互換性を向上
            const basePath = window.location.pathname.includes('/games/') 
                ? '../../assets/lang/' 
                : './assets/lang/';
            const response = await fetch(`${basePath}${lang}.json`);
            if (!response.ok) {
                throw new Error(`Failed to load ${lang}.json`);
            }
            const translations = await response.json();
            this.translations[lang] = translations;
            return translations;
        } catch (error) {
            console.warn(`Failed to load translations for ${lang}:`, error);
            
            // フォールバック言語を試す
            if (lang !== this.fallbackLanguage) {
                return this.loadTranslations(this.fallbackLanguage);
            }
            
            return {};
        }
    }

    // 翻訳テキストを取得
    t(key, params = {}) {
        const keys = key.split('.');
        let value = this.translations[this.currentLanguage];

        // キーを辿って値を取得
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                // フォールバック言語で試す
                value = this.translations[this.fallbackLanguage];
                for (const fallbackKey of keys) {
                    if (value && typeof value === 'object' && fallbackKey in value) {
                        value = value[fallbackKey];
                    } else {
                        console.warn(`Translation key not found: ${key}`);
                        return key; // キーをそのまま返す
                    }
                }
                break;
            }
        }

        if (typeof value !== 'string') {
            console.warn(`Translation value is not a string: ${key}`);
            return key;
        }

        // パラメータ置換
        return this.interpolate(value, params);
    }

    // パラメータ置換
    interpolate(text, params) {
        return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
            return params[key] !== undefined ? params[key] : match;
        });
    }

    // 言語を変更
    async changeLanguage(lang) {
        await this.loadTranslations(lang);
        this.currentLanguage = lang;
        this.setStoredLanguage(lang);
        
        // ページの翻訳を更新
        this.updatePageTranslations();
        
        // カスタムイベントを発火
        window.dispatchEvent(new CustomEvent('languageChanged', { 
            detail: { language: lang } 
        }));
    }

    // ページ内の翻訳を更新
    updatePageTranslations() {
        // data-i18n属性を持つ要素を更新
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translatedText = this.t(key);
            
            if (element.tagName === 'INPUT' && (element.type === 'button' || element.type === 'submit')) {
                element.value = translatedText;
            } else if (element.tagName === 'INPUT' && element.placeholder !== undefined) {
                element.placeholder = translatedText;
            } else {
                element.textContent = translatedText;
            }
        });

        // data-i18n-title属性を持つ要素のtitleを更新
        document.querySelectorAll('[data-i18n-title]').forEach(element => {
            const key = element.getAttribute('data-i18n-title');
            element.title = this.t(key);
        });

        // HTMLのlang属性を更新
        document.documentElement.lang = this.currentLanguage;
    }

    // 初期化
    async init() {
        await this.loadTranslations(this.currentLanguage);
        
        // フォールバック言語も読み込み
        if (this.currentLanguage !== this.fallbackLanguage) {
            await this.loadTranslations(this.fallbackLanguage);
        }

        this.updatePageTranslations();
        this.createLanguageSwitcher();
    }

    // 言語切り替えボタンを作成
    createLanguageSwitcher() {
        const switcher = document.createElement('div');
        switcher.className = 'language-switcher';
        switcher.innerHTML = `
            <button class="lang-btn ${this.currentLanguage === 'en' ? 'active' : ''}" data-lang="en">
                🇺🇸 EN
            </button>
            <button class="lang-btn ${this.currentLanguage === 'ja' ? 'active' : ''}" data-lang="ja">
                🇯🇵 JP
            </button>
        `;

        // スタイルを追加
        if (!document.querySelector('#language-switcher-styles')) {
            const styles = document.createElement('style');
            styles.id = 'language-switcher-styles';
            styles.textContent = `
                .language-switcher {
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    display: flex;
                    gap: 8px;
                    z-index: 1000;
                }
                
                .lang-btn {
                    padding: 8px 12px;
                    border: 2px solid var(--gray-300, #d1d5db);
                    border-radius: 8px;
                    background: white;
                    cursor: pointer;
                    font-size: 14px;
                    font-weight: 500;
                    transition: all 0.2s;
                    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
                }
                
                .lang-btn:hover {
                    border-color: var(--primary, #6366f1);
                    transform: translateY(-1px);
                    box-shadow: 0 4px 8px rgba(0,0,0,0.15);
                }
                
                .lang-btn.active {
                    background: var(--primary, #6366f1);
                    color: white;
                    border-color: var(--primary, #6366f1);
                }
                
                @media (max-width: 768px) {
                    .language-switcher {
                        top: 10px;
                        right: 10px;
                    }
                    
                    .lang-btn {
                        padding: 6px 10px;
                        font-size: 12px;
                    }
                }
            `;
            document.head.appendChild(styles);
        }

        // イベントリスナーを追加
        switcher.addEventListener('click', async (e) => {
            if (e.target.classList.contains('lang-btn')) {
                const lang = e.target.getAttribute('data-lang');
                await this.changeLanguage(lang);
                
                // ボタンの状態を更新
                switcher.querySelectorAll('.lang-btn').forEach(btn => {
                    btn.classList.toggle('active', btn.getAttribute('data-lang') === lang);
                });
            }
        });

        document.body.appendChild(switcher);
    }

    // 現在の言語を取得
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // サポートされている言語一覧を取得
    getSupportedLanguages() {
        return ['en', 'ja'];
    }
}

// グローバルインスタンスを作成
window.i18n = new I18n();