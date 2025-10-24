# ファイル構成

## 新しいフォルダ構造

```
games/
├── index.html                    # トップページ
├── README.md                     # プロジェクト説明
├── AGENTS.md                     # エージェント情報
├── CNAME                         # GitHub Pages設定
├── STRUCTURE.md                  # このファイル
├── assets/                       # 共通リソース
│   ├── css/
│   │   └── common.css           # 共通スタイル（ホームボタンなど）
│   └── images/                  # 画像ファイル
│       ├── dress_up_game/       # 着せ替えゲーム画像
│       ├── puzzle_game/         # パズルゲーム画像
│       └── spot_the_difference/ # 間違い探し画像
└── games/                       # ゲームフォルダ
    ├── drawing/                 # お絵描きゲーム
    │   ├── index.html
    │   ├── style.css
    │   └── script.js
    ├── puzzle/                  # パズルゲーム
    │   ├── index.html
    │   ├── style.css
    │   └── script.js
    ├── matching/                # マッチングゲーム
    │   ├── index.html
    │   ├── style.css
    │   └── script.js
    ├── dress_up/                # 着せ替えゲーム
    │   ├── index.html
    │   ├── style.css
    │   └── script.js
    ├── othello/                 # オセロゲーム
    │   ├── index.html
    │   ├── style.css
    │   └── script.js
    ├── shogi/                   # 将棋ゲーム
    │   ├── index.html
    │   ├── style.css
    │   └── script.js
    ├── spot_the_difference/     # 間違い探しゲーム
    │   ├── index.html
    │   ├── style.css
    │   └── script.js
    ├── rhythm/                  # リズムゲーム
    │   ├── index.html
    │   ├── style.css
    │   └── script.js
    ├── whack_a_mole/           # モグラ叩きゲーム
    │   ├── index.html
    │   ├── style.css
    │   └── script.js
    └── learning_quiz/          # 学習クイズゲーム
        ├── index.html
        ├── style.css
        └── script.js
```

## 利点

### 🗂️ **管理しやすさ**
- ゲームごとにフォルダ分け
- 統一されたファイル名（index.html, style.css, script.js）
- 共通リソースの一元管理

### 🔧 **保守性**
- 共通スタイルの一元化
- 画像ファイルの整理
- 相対パスの統一

### 📈 **拡張性**
- 新しいゲームの追加が簡単
- 共通機能の追加が容易
- バージョン管理が明確

## 移行状況

✅ **完了**
- drawing（お絵描きゲーム）
- puzzle（パズルゲーム）
- 共通CSS作成
- 画像フォルダ移動

🔄 **進行中**
- 残りのゲームの移行
- パス修正
- 旧ファイルの削除

## 注意事項

- 旧ファイルは移行完了後に削除予定
- GitHub Pagesの設定確認が必要
- 相対パスの修正が必要