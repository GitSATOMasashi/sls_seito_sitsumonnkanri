document.addEventListener('DOMContentLoaded', function() {
    // ハンバーガーメニューの制御
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-container');

    if (hamburgerMenu && sidebar && mainContent) {
        hamburgerMenu.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            hamburgerMenu.classList.toggle('active');
        });

        // メインコンテンツクリックでメニューを閉じる
        mainContent.addEventListener('click', function() {
            if (sidebar.classList.contains('active')) {
                sidebar.classList.remove('active');
                hamburgerMenu.classList.remove('active');
            }
        });
    }

    // 質問アイテムのクラスを状態に基づいて更新
    const questionItems = document.querySelectorAll('.question-item');
    
    questionItems.forEach(item => {
        // 解決済みボタンの有無で状態を判断
        const resolveButton = item.querySelector('.btn-outline');
        
        if (!resolveButton) {
            item.classList.add('resolved');
        } else {
            item.classList.add('unsolved');
        }
    });

    // サイドバーのタイプフィルター
    const typeFilterItems = document.querySelectorAll('.sidebar-item[data-filter-type]');
    const instructorStatusSection = document.getElementById('instructorStatusSection');
    
    typeFilterItems.forEach(item => {
        item.addEventListener('click', function() {
            console.log('Type filter clicked:', this.querySelector('.sidebar-text').textContent);
            // アクティブクラスを全て削除
            typeFilterItems.forEach(i => i.classList.remove('active'));
            
            // クリックされた項目にアクティブクラスを追加
            this.classList.add('active');
            
            const filterType = this.dataset.filterType;
            
            // 講師が選択された場合のみステータスセクションを表示
            if (filterType === 'instructor') {
                instructorStatusSection.style.display = 'block';
                instructorStatusSection.classList.add('visible');
            } else {
                instructorStatusSection.classList.remove('visible');
                instructorStatusSection.style.display = 'none';
                
                // ステータスフィルターをリセット
                const allStatusItem = document.querySelector('.filter-tab[data-filter-status="all"]');
                if (allStatusItem) {
                    allStatusItem.classList.add('active');
                    document.querySelectorAll('.filter-tab[data-filter-status]:not([data-filter-status="all"])').forEach(i => {
                        i.classList.remove('active');
                    });
                }
            }
            
            // ページを1に戻す
            currentPage = 1;
            
            // 質問リストを再レンダリング
            renderQuestionList();
        });
    });
    
    // 講師ステータスフィルターのイベントリスナー
    const statusFilterItems = document.querySelectorAll('.filter-tab[data-filter-status]');
    statusFilterItems.forEach(item => {
        item.addEventListener('click', function() {
            console.log('Status filter clicked:', this.textContent.trim());
            // アクティブクラスを全て削除
            statusFilterItems.forEach(i => i.classList.remove('active'));
            
            // クリックされた項目にアクティブクラスを追加
            this.classList.add('active');
            
            // ページを1に戻す
            currentPage = 1;
            
            // 質問リストを再レンダリング
            renderQuestionList();
        });
    });
    
    // グローバル変数の定義位置を修正
    let currentPage = 1;
    const itemsPerPage = 10; // 1ページあたりの表示件数
    let totalItems = document.querySelectorAll('.question-item').length;

    // 表示するアイテムの切り替え - フィルタリングを考慮
    function updateVisibleItems() {
        console.log('Updating visible items for page:', currentPage);
        const questionItems = document.querySelectorAll('.question-item');
        
        // フィルタリングされていないアイテムを取得
        const visibleItems = Array.from(questionItems).filter(item => 
            item.dataset.filteredOut !== 'true'
        );
        
        // 総アイテム数を更新
        totalItems = visibleItems.length;
        console.log('Total visible items:', totalItems);
        
        // すべてのアイテムを一旦非表示にする
        questionItems.forEach(item => {
            item.style.display = 'none';
        });
        
        // 現在のページに表示すべきアイテムだけを表示する
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, visibleItems.length);
        
        console.log(`Showing items from ${startIndex} to ${endIndex-1} of filtered items`);
        
        for (let i = startIndex; i < endIndex; i++) {
            if (visibleItems[i]) {
                visibleItems[i].style.display = 'flex';
                console.log(`Showing item: ${visibleItems[i].querySelector('.action-name').textContent}`);
            }
        }
        
        // ページネーション情報を更新
        updatePaginationInfo();
    }

    // ページネーション情報の更新
    function updatePaginationInfo() {
        const startItem = (currentPage - 1) * itemsPerPage + 1;
        const endItem = Math.min(currentPage * itemsPerPage, totalItems);
        
        // ページネーション情報の更新
        const paginationInfo = document.querySelector('.pagination-info');
        if (paginationInfo) {
            paginationInfo.textContent = `${startItem}-${endItem}/${totalItems}件`;
        }
        
        // ボタンの有効/無効状態の更新
        const prevButton = document.querySelector('.prev-btn');
        const nextButton = document.querySelector('.next-btn');
        
        if (prevButton) {
            prevButton.disabled = currentPage <= 1;
        }
        
        if (nextButton) {
            const maxPage = Math.ceil(totalItems / itemsPerPage);
            nextButton.disabled = currentPage >= maxPage;
        }
        
        console.log('Pagination updated:', startItem, '-', endItem, '/', totalItems);
    }

    // ページネーションボタンのイベントリスナー
    const prevButton = document.querySelector('.prev-btn');
    const nextButton = document.querySelector('.next-btn');
    
    if (prevButton) {
        prevButton.addEventListener('click', function() {
            if (currentPage > 1) {
                currentPage--;
                renderQuestionList(); // 質問リストを再レンダリング
            }
        });
    }
    
    if (nextButton) {
        nextButton.addEventListener('click', function() {
            const totalItems = getFilteredQuestionCount();
            const maxPage = Math.ceil(totalItems / itemsPerPage);
            if (currentPage < maxPage) {
                currentPage++;
                renderQuestionList(); // 質問リストを再レンダリング
            }
        });
    }

    // 初期表示の設定
    updateVisibleItems();

    // フィルタリング関数の修正
    function filterQuestions() {
        console.log('Filtering questions...');
        const activeTypeItem = document.querySelector('.sidebar-item[data-filter-type].active');
        const activeType = activeTypeItem ? activeTypeItem.dataset.filterType : 'all';
        
        const activeStatusItem = document.querySelector('.filter-tab[data-filter-status].active');
        const activeStatus = (instructorStatusSection.style.display === 'none' || !activeStatusItem) ? 'all' : 
                            activeStatusItem.dataset.filterStatus;
        
        console.log('Active filters:', activeType, activeStatus);
        
        const questionItems = document.querySelectorAll('.question-item');
        
        questionItems.forEach(item => {
            // デフォルトではフィルタリングされていない
            item.dataset.filteredOut = 'false';
            
            // タイプフィルター
            let typeMatch = true;
            if (activeType !== 'all') {
                if (activeType === 'ai') {
                    typeMatch = item.querySelector('.badge-ai') !== null;
                } else if (activeType === 'instructor') {
                    typeMatch = item.querySelector('.badge-instructor') !== null;
                }
            }
            
            // ステータスフィルター（講師タブ選択時のみ適用）
            let statusMatch = true;
            if (activeType === 'instructor' && activeStatus !== 'all') {
                if (activeStatus === 'pending') {
                    // 解決済みボタンがあり、通知バッジがない場合は「質問送信済み」
                    statusMatch = item.querySelector('.btn-outline') !== null && 
                                 item.querySelector('.notification-badge') === null;
                } else if (activeStatus === 'unread') {
                    // 通知バッジがある場合は「未読」
                    statusMatch = item.querySelector('.notification-badge') !== null;
                } else if (activeStatus === 'read') {
                    // 解決済みボタンがなく、通知バッジもない場合は「既読」
                    statusMatch = item.querySelector('.btn-outline') === null && 
                                 item.querySelector('.notification-badge') === null;
                }
            }
            
            // 両方の条件に一致する場合のみ表示対象とする
            if (!typeMatch || !statusMatch) {
                item.dataset.filteredOut = 'true';
            }
        });
        
        // ページを1に戻す
        currentPage = 1;
        
        // 表示アイテムを更新
        updateVisibleItems();
        
        // サイドバーのカウント数を更新
        updateSidebarCounts();
    }

    // サイドバーのカウント数を更新する関数
    function updateSidebarCounts() {
        // 全体のカウント
        const allCount = document.querySelectorAll('.question-item').length;
        document.querySelector('.sidebar-item[data-filter-type="all"] .sidebar-count').textContent = allCount;
        
        // AIアシスタントのカウント
        const aiCount = document.querySelectorAll('.question-item .badge-ai').length;
        document.querySelector('.sidebar-item[data-filter-type="ai"] .sidebar-count').textContent = aiCount;
        
        // 講師のカウント
        const instructorCount = document.querySelectorAll('.question-item .badge-instructor').length;
        document.querySelector('.sidebar-item[data-filter-type="instructor"] .sidebar-count').textContent = instructorCount;
        
        // 未読カウント（オプション）
        const unreadCount = document.querySelectorAll('.question-item.unread').length;
        console.log('未読メッセージ数:', unreadCount);
    }

    // 「続きを読む」ボタンの機能
    const readMoreButtons = document.querySelectorAll('.read-more-btn');
    
    readMoreButtons.forEach(button => {
        button.addEventListener('click', function() {
            const content = this.closest('.question-text-content');
            content.classList.toggle('expanded');
            
            if (content.classList.contains('expanded')) {
                this.textContent = '折りたたむ';
            } else {
                this.textContent = '続きを読む';
            }
        });
    });

    // 解決済みにするボタンの機能
    const resolveButtons = document.querySelectorAll('.btn-outline');

    resolveButtons.forEach(button => {
        button.addEventListener('click', function() {
            const questionItem = this.closest('.question-item');
            
            // 質問アイテムのクラスを更新
            questionItem.classList.remove('unsolved');
            questionItem.classList.add('resolved');
            
            // 解決済みボタンを削除
            this.remove();
            
            // フィルタリングを更新
            filterQuestions();
        });
    });
    
    // スクロール時のヘッダーボーダー制御
    const questionList = document.querySelector('.question-list');
    const contentHeader = document.querySelector('.question-content-header');
    
    if (questionList && contentHeader) {
        // スクロールイベントリスナーを追加
        questionList.addEventListener('scroll', function() {
            // スクロール位置が0より大きい場合はボーダーを表示
            if (questionList.scrollTop > 0) {
                contentHeader.classList.add('with-border');
            } else {
                contentHeader.classList.remove('with-border');
            }
        });
    }

    // 質問アイテムのクリックイベント
    questionItems.forEach(item => {
        item.addEventListener('click', function(e) {
            // オプションボタンのクリックは伝播させない
            if (e.target.closest('.option-btn')) {
                return;
            }
            
            // チャット詳細ページへ遷移
            console.log('チャット詳細を表示:', this.querySelector('.action-name').textContent);
            // window.location.href = 'chat-detail.html?id=' + this.dataset.chatId;
        });
    });
    
    // オプションボタンのクリックイベント
    const moreButtons = document.querySelectorAll('.more-btn');
    
    moreButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // 親要素へのクリックイベントの伝播を防止
            
            // 他のオプションメニューを閉じる
            document.querySelectorAll('.question-options.active').forEach(item => {
                if (item !== this.closest('.question-options')) {
                    item.classList.remove('active');
                }
            });
            
            // クリックされたオプションメニューの表示/非表示を切り替え
            this.closest('.question-options').classList.toggle('active');
        });
    });
    
    // ドキュメント全体のクリックでオプションメニューを閉じる
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.question-options')) {
            document.querySelectorAll('.question-options.active').forEach(item => {
                item.classList.remove('active');
            });
        }
    });
    
    // ピン留めボタンのクリックイベント
    const pinButtons = document.querySelectorAll('.pin-btn');
    
    pinButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // 親要素へのクリックイベントの伝播を防止
            
            const questionItem = this.closest('.question-item');
            questionItem.classList.toggle('pinned');
            
            if (questionItem.classList.contains('pinned')) {
                console.log('ピン留めしました:', questionItem.querySelector('.action-name').textContent);
                // ピン留めアイテムをリストの先頭に移動
                const parent = questionItem.parentNode;
                parent.insertBefore(questionItem, parent.firstChild);
            } else {
                console.log('ピン留めを解除しました:', questionItem.querySelector('.action-name').textContent);
            }
            
            // オプションメニューを閉じる
            this.closest('.question-options').classList.remove('active');
        });
    });
    
    // 削除ボタンのクリックイベント
    const deleteButtons = document.querySelectorAll('.delete-btn');
    
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // 親要素へのクリックイベントの伝播を防止
            
            const questionItem = this.closest('.question-item');
            const actionName = questionItem.querySelector('.action-name').textContent;
            
            if (confirm(`「${actionName}」の会話を削除しますか？`)) {
                console.log('削除しました:', actionName);
                questionItem.remove();
                
                // サイドバーのカウント数を更新
                updateSidebarCounts();
            }
            
            // オプションメニューを閉じる
            this.closest('.question-options').classList.remove('active');
        });
    });
    
    // 未読/既読の切り替え（デモ用）
    questionItems.forEach(item => {
        // ダブルクリックで未読/既読を切り替え（デモ用）
        item.addEventListener('dblclick', function(e) {
            this.classList.toggle('unread');
            console.log(this.classList.contains('unread') ? '未読にしました' : '既読にしました');
            
            // サイドバーのカウント数を更新
            updateSidebarCounts();
        });
    });

    // コース、アクションマップ、アクションのサンプルデータ
    const courseData = {
        courses: [
            {
                name: "Webエンジニア養成",
                actionMaps: [
                    {
                        name: "フロントエンド開発マスター",
                        actions: [
                            "モダンHTML/CSS設計手法",
                            "JavaScript/TypeScript実践",
                            "Reactコンポーネント設計",
                            "パフォーマンス最適化技術"
                        ]
                    },
                    {
                        name: "バックエンド技術体系",
                        actions: [
                            "Node.jsサーバー構築",
                            "データベース設計と最適化",
                            "RESTful API設計原則",
                            "認証・認可システム実装"
                        ]
                    },
                    {
                        name: "実践Webアプリケーション開発",
                        actions: [
                            "フルスタックアプリ設計",
                            "CI/CDパイプライン構築",
                            "テスト駆動開発の実践",
                            "セキュリティ対策の実装"
                        ]
                    }
                ]
            },
            {
                name: "UI/UXデザイン実践",
                actionMaps: [
                    {
                        name: "ユーザー中心設計プロセス",
                        actions: [
                            "ユーザーリサーチ手法",
                            "ペルソナとカスタマージャーニー",
                            "情報アーキテクチャ設計",
                            "ユーザビリティテスト実施"
                        ]
                    },
                    {
                        name: "インターフェースデザイン実践",
                        actions: [
                            "視覚デザインの原則と実践",
                            "レスポンシブUIデザイン",
                            "アクセシビリティ対応デザイン",
                            "デザインシステム構築"
                        ]
                    },
                    {
                        name: "プロトタイピングと検証",
                        actions: [
                            "ローファイプロトタイピング",
                            "インタラクティブプロトタイプ作成",
                            "ユーザーテストの設計と実施",
                            "反復的デザイン改善プロセス"
                        ]
                    }
                ]
            },
            {
                name: "データサイエンス基礎",
                actionMaps: [
                    {
                        name: "データ分析基礎技法",
                        actions: [
                            "Pythonによるデータ処理",
                            "統計分析の基礎と応用",
                            "データ可視化テクニック",
                            "探索的データ分析の実践"
                        ]
                    },
                    {
                        name: "機械学習アルゴリズム入門",
                        actions: [
                            "教師あり学習の基礎",
                            "教師なし学習手法",
                            "モデル評価と選択",
                            "深層学習入門"
                        ]
                    },
                    {
                        name: "ビジネスデータ活用実践",
                        actions: [
                            "ビジネスKPI設計と分析",
                            "顧客行動分析の手法",
                            "予測モデルの業務適用",
                            "データ分析レポーティング"
                        ]
                    }
                ]
            },
            {
                name: "モバイルアプリ開発",
                actionMaps: [
                    {
                        name: "クロスプラットフォーム開発",
                        actions: [
                            "React Nativeアプリ開発",
                            "Flutterフレームワーク活用",
                            "クロスプラットフォームの設計パターン",
                            "パフォーマンス最適化手法"
                        ]
                    },
                    {
                        name: "ネイティブアプリ開発",
                        actions: [
                            "Swift/iOS開発基礎",
                            "Kotlin/Android開発基礎",
                            "ネイティブUIコンポーネント実装",
                            "デバイス機能の活用手法"
                        ]
                    },
                    {
                        name: "モバイルUX設計",
                        actions: [
                            "モバイル特有のUXパターン",
                            "ジェスチャーとインタラクション設計",
                            "オフライン対応アプリ設計",
                            "モバイルアプリのユーザビリティテスト"
                        ]
                    }
                ]
            },
            {
                name: "クラウドエンジニアリング",
                actionMaps: [
                    {
                        name: "AWSクラウド環境構築",
                        actions: [
                            "EC2/ECSによるサーバー構築",
                            "RDS/DynamoDBデータベース設計",
                            "S3/CloudFrontによるコンテンツ配信",
                            "IAMセキュリティ設計"
                        ]
                    },
                    {
                        name: "マイクロサービスアーキテクチャ",
                        actions: [
                            "サービス分割の設計手法",
                            "APIゲートウェイの構築",
                            "コンテナオーケストレーション",
                            "分散システムのモニタリング"
                        ]
                    },
                    {
                        name: "DevOpsワークフロー実践",
                        actions: [
                            "GitHubワークフロー設計",
                            "CI/CDパイプライン構築",
                            "インフラのコード化（IaC）",
                            "モニタリングとロギング設計"
                        ]
                    }
                ]
            },
            {
                name: "ビジネスDX実践",
                actionMaps: [
                    {
                        name: "デジタルマーケティング戦略",
                        actions: [
                            "デジタルマーケティング基礎",
                            "SEO/SEM最適化手法",
                            "SNSマーケティング実践",
                            "マーケティングオートメーション"
                        ]
                    },
                    {
                        name: "データドリブン経営",
                        actions: [
                            "ビジネスデータ分析基礎",
                            "KPI設計とダッシュボード構築",
                            "A/Bテスト設計と実施",
                            "データに基づく意思決定プロセス"
                        ]
                    },
                    {
                        name: "アジャイルプロジェクト管理",
                        actions: [
                            "スクラム開発手法の実践",
                            "カンバンによるタスク管理",
                            "アジャイルチームビルディング",
                            "継続的改善プロセス"
                        ]
                    }
                ]
            }
        ]
    };

    // ランダムなコースパスを生成する関数
    function getRandomCoursePath() {
        const courseIndex = Math.floor(Math.random() * courseData.courses.length);
        const course = courseData.courses[courseIndex];
        
        const actionMapIndex = Math.floor(Math.random() * course.actionMaps.length);
        const actionMap = course.actionMaps[actionMapIndex];
        
        const actionIndex = Math.floor(Math.random() * actionMap.actions.length);
        const action = actionMap.actions[actionIndex];
        
        return {
            path: `${course.name} > ${actionMap.name}`,
            action: action
        };
    }

    // 質問アイテムのaction-pathとaction-nameを更新する関数
    function updateQuestionItems() {
        const questionItems = document.querySelectorAll('.question-item');
        
        questionItems.forEach(item => {
            const coursePath = getRandomCoursePath();
            
            // action-pathを更新
            const actionPathElement = item.querySelector('.action-path');
            if (actionPathElement) {
                actionPathElement.textContent = coursePath.path;
            }
            
            // action-nameを更新
            const actionNameElement = item.querySelector('.action-name');
            if (actionNameElement) {
                actionNameElement.textContent = coursePath.action;
            }
        });
    }

    // ヘッダーとサイドバーのドロップダウンを更新
    const headerDropdowns = document.querySelectorAll('.header-dropdown');
    headerDropdowns.forEach(dropdown => {
        dropdown.innerHTML = '<option>スキルプラス</option>';
    });
    
    // 質問アイテムのコースパスを更新
    updateQuestionItems();

    // 質問アイテムのサンプルデータ
    const questionData = [
        {
            id: 1,
            type: "ai",
            path: "Webエンジニア養成 > フロントエンド開発マスター",
            name: "Reactコンポーネント設計",
            message: "Reactコンポーネントの設計について質問があります。再利用可能なコンポーネントを作成する際のベストプラクティスを教えてください。",
            date: "3日前",
            isUnread: false,
            isPinned: false
        },
        {
            id: 2,
            type: "instructor",
            path: "データサイエンス基礎 > 機械学習アルゴリズム入門",
            name: "教師あり学習の基礎",
            message: "教師あり学習のアルゴリズムについて質問があります。分類と回帰の違いについて詳しく教えていただけますか？",
            date: "5日前",
            isUnread: true,
            isPinned: false
        },
        {
            id: 3,
            type: "ai",
            path: "モバイルアプリ開発 > クロスプラットフォーム開発",
            name: "React Nativeアプリ開発",
            message: "React Nativeでのパフォーマンス最適化について教えてください。特に画像の読み込みを効率化する方法を知りたいです。",
            date: "1週間前",
            isUnread: false,
            isPinned: true
        },
        {
            id: 4,
            type: "instructor",
            path: "クラウドエンジニアリング > AWSクラウド基礎",
            name: "S3バケットのセキュリティ設定",
            message: "AWSのS3バケットのセキュリティ設定について質問があります。適切なアクセス制御の方法を教えてください。",
            date: "2週間前",
            isUnread: false,
            isPinned: false
        },
        {
            id: 5,
            type: "ai",
            path: "UI/UXデザイン実践 > ユーザー調査手法",
            name: "効果的なユーザーインタビュー",
            message: "ユーザーインタビューを効果的に行うためのコツを教えてください。質問の仕方や記録の取り方について知りたいです。",
            date: "2週間前",
            isUnread: false,
            isPinned: false
        },
        {
            id: 6,
            type: "ai",
            path: "データベース設計 > SQLマスター講座",
            name: "複雑なJOINクエリの最適化",
            message: "複数テーブルを結合する複雑なSQLクエリのパフォーマンスを向上させる方法について教えてください。特にインデックス設計のポイントを知りたいです。",
            date: "3週間前",
            isUnread: false,
            isPinned: false
        },
        {
            id: 7,
            type: "instructor",
            path: "セキュリティエンジニアリング > ペネトレーションテスト",
            name: "Webアプリケーションの脆弱性診断",
            message: "自社開発のWebアプリケーションの脆弱性診断を行いたいです。効果的なペネトレーションテストの進め方と、よくある脆弱性の検出方法を教えてください。",
            date: "1ヶ月前",
            isUnread: true,
            isPinned: true
        },
        {
            id: 8,
            type: "ai",
            path: "DevOps実践 > CI/CD構築",
            name: "GitHubActionsのワークフロー設計",
            message: "GitHubActionsを使ったCI/CDパイプラインの構築方法について質問があります。テスト、ビルド、デプロイを自動化する効率的なワークフローの設計方法を教えてください。",
            date: "1ヶ月前",
            isUnread: false,
            isPinned: false
        },
        {
            id: 9,
            type: "instructor",
            path: "プロジェクト管理 > アジャイル開発手法",
            name: "スクラムチームのファシリテーション",
            message: "スクラムマスターとして、チームのパフォーマンスを向上させるための効果的なファシリテーション技術について教えてください。特にデイリースクラムとスプリントレトロスペクティブの進行方法に悩んでいます。",
            date: "1ヶ月前",
            isUnread: false,
            isPinned: false
        },
        {
            id: 10,
            type: "ai",
            path: "ブロックチェーン技術 > スマートコントラクト開発",
            name: "Solidityのセキュリティベストプラクティス",
            message: "Ethereumのスマートコントラクト開発におけるセキュリティ上の注意点とベストプラクティスについて教えてください。特にリエントランシー攻撃の防止方法に興味があります。",
            date: "2ヶ月前",
            isUnread: false,
            isPinned: false
        },
        {
            id: 11,
            type: "instructor",
            path: "データ分析 > Pythonによる統計解析",
            name: "時系列データの予測モデル",
            message: "販売データの時系列分析を行いたいです。Pythonを使った季節性を考慮した予測モデルの構築方法と、精度評価の指標について教えてください。",
            date: "2ヶ月前",
            isUnread: true,
            isPinned: false
        },
        {
            id: 12,
            type: "ai",
            path: "システム設計 > マイクロサービスアーキテクチャ",
            name: "サービス間通信の設計パターン",
            message: "マイクロサービスアーキテクチャにおけるサービス間通信の最適な方法について質問があります。同期通信と非同期通信のトレードオフと、適切な使い分けについて教えてください。",
            date: "2ヶ月前",
            isUnread: false,
            isPinned: true
        },
        {
            id: 13,
            type: "instructor",
            path: "ネットワークエンジニアリング > ゼロトラストセキュリティ",
            name: "ゼロトラストモデルの実装ステップ",
            message: "従来のネットワークセキュリティモデルからゼロトラストモデルへの移行を検討しています。実装の具体的なステップと、優先すべき対策について教えてください。",
            date: "3ヶ月前",
            isUnread: false,
            isPinned: false
        },
        {
            id: 14,
            type: "ai",
            path: "フロントエンド最適化 > パフォーマンスチューニング",
            name: "Webフォントの最適なロード方法",
            message: "Webサイトのパフォーマンスを向上させるために、Webフォントの最適なロード方法について教えてください。特にCLSの改善に効果的な方法を知りたいです。",
            date: "3ヶ月前",
            isUnread: false,
            isPinned: false
        },
        {
            id: 15,
            type: "instructor",
            path: "AIエンジニアリング > 自然言語処理",
            name: "BERTモデルのファインチューニング",
            message: "特定ドメインのテキスト分類タスクのために、事前学習済みBERTモデルのファインチューニング方法について教えてください。特に少量のラベル付きデータでの効率的な学習方法に興味があります。",
            date: "3ヶ月前",
            isUnread: true,
            isPinned: false
        },
        {
            id: 16,
            type: "ai",
            path: "コンテナ技術 > Kubernetes運用",
            name: "Kubernetesクラスターのリソース管理",
            message: "Kubernetesクラスターでのリソース管理の最適化について質問があります。特にリソースクォータとリミットレンジの適切な設定方法と、オートスケーリングの戦略について教えてください。",
            date: "4ヶ月前",
            isUnread: false,
            isPinned: false
        },
        {
            id: 17,
            type: "instructor",
            path: "バックエンド開発 > APIデザイン",
            name: "RESTful APIのバージョニング戦略",
            message: "長期的に運用するRESTful APIのバージョニング戦略について教えてください。特に後方互換性を維持しながら新機能を追加する方法と、クライアントへの影響を最小化する方法を知りたいです。",
            date: "4ヶ月前",
            isUnread: false,
            isPinned: true
        },
        {
            id: 18,
            type: "ai",
            path: "モバイルアプリ開発 > iOS開発",
            name: "SwiftUIでのアニメーション実装",
            message: "SwiftUIを使った複雑なアニメーションの実装方法について教えてください。特に画面遷移時のカスタムトランジションと、インタラクティブなアニメーションの実装例を知りたいです。",
            date: "5ヶ月前",
            isUnread: false,
            isPinned: false
        },
        {
            id: 19,
            type: "instructor",
            path: "データエンジニアリング > データパイプライン構築",
            name: "リアルタイムデータ処理アーキテクチャ",
            message: "大量のセンサーデータをリアルタイムで処理するためのアーキテクチャ設計について教えてください。Apache KafkaとSparkを使った効率的なデータパイプラインの構築方法に興味があります。",
            date: "5ヶ月前",
            isUnread: true,
            isPinned: false
        },
        {
            id: 20,
            type: "ai",
            path: "クラウドアーキテクチャ > サーバーレスコンピューティング",
            name: "AWS Lambdaのコールドスタート対策",
            message: "AWS Lambdaのコールドスタート問題を軽減する方法について教えてください。特にJavaやPythonなど言語による違いと、Provisioned Concurrencyの適切な設定方法を知りたいです。",
            date: "6ヶ月前",
            isUnread: false,
            isPinned: false
        },
        {
            id: 21,
            type: "instructor",
            path: "セキュアコーディング > コード品質向上",
            name: "静的解析ツールの導入と活用",
            message: "開発プロセスに静的解析ツールを導入したいと考えています。Java/TypeScriptプロジェクトに適した静的解析ツールの選定基準と、CIパイプラインへの統合方法について教えてください。",
            date: "6ヶ月前",
            isUnread: false,
            isPinned: true
        },
        {
            id: 22,
            type: "ai",
            path: "UI/UXデザイン > アクセシビリティ",
            name: "Webアプリケーションのアクセシビリティ向上",
            message: "Webアプリケーションのアクセシビリティを向上させるための具体的な実装方法について教えてください。特にSPAでのキーボードナビゲーションとスクリーンリーダー対応の実装例を知りたいです。",
            date: "7ヶ月前",
            isUnread: false,
            isPinned: false
        },
        {
            id: 23,
            type: "instructor",
            path: "テスト自動化 > E2Eテスト戦略",
            name: "Cypressを使ったE2Eテスト設計",
            message: "Cypressを使ったE2Eテストの効率的な設計方法について教えてください。特にテストデータの管理方法と、テスト実行時間の短縮テクニックに興味があります。",
            date: "8ヶ月前",
            isUnread: false,
            isPinned: false
        }];

    // 質問リストを生成する関数を修正
    function renderQuestionList() {
        const questionList = document.querySelector('.question-list');
        
        // リストをクリア
        questionList.innerHTML = '';
        
        // フィルタリングを適用
        const activeTypeItem = document.querySelector('.sidebar-item[data-filter-type].active');
        const activeType = activeTypeItem ? activeTypeItem.dataset.filterType : 'all';
        
        const instructorStatusSection = document.getElementById('instructorStatusSection');
        const activeStatusItem = document.querySelector('.filter-tab[data-filter-status].active');
        const activeStatus = (instructorStatusSection.style.display === 'none' || !activeStatusItem) ? 'all' : 
                            activeStatusItem.dataset.filterStatus;
        
        console.log('Rendering with filters:', activeType, activeStatus);
        
        // フィルタリング条件に基づいてデータをフィルタリング
        let filteredData = [...questionData];
        
        // タイプフィルター
        if (activeType !== 'all') {
            filteredData = filteredData.filter(q => q.type === activeType);
        }
        
        // ステータスフィルター（講師の場合のみ）
        if (activeType === 'instructor' && activeStatus !== 'all') {
            if (activeStatus === 'unread') {
                filteredData = filteredData.filter(q => q.isUnread);
            } else if (activeStatus === 'read') {
                filteredData = filteredData.filter(q => !q.isUnread);
            } else if (activeStatus === 'pending') {
                // 質問送信済みの条件を定義（例：特定のフラグがある場合）
                // この例では単純に講師宛ての質問すべてを「送信済み」とみなします
                filteredData = filteredData.filter(q => q.type === 'instructor');
            }
        }
        
        // ピン留めされたアイテムを先頭に表示
        filteredData.sort((a, b) => {
            if (a.isPinned && !b.isPinned) return -1;
            if (!a.isPinned && b.isPinned) return 1;
            return 0;
        });
        
        // 総アイテム数
        const totalItems = filteredData.length;
        
        // 最大ページ数を計算
        const maxPage = Math.ceil(totalItems / itemsPerPage);
        
        // 現在のページが最大ページを超えないようにする
        if (currentPage > maxPage && maxPage > 0) {
            currentPage = maxPage;
        } else if (currentPage < 1 || maxPage === 0) {
            currentPage = 1;
        }
        
        console.log('Current page:', currentPage, 'of', maxPage, 'pages');
        
        // 現在のページに表示するアイテムを取得
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
        const currentPageItems = filteredData.slice(startIndex, endIndex);
        
        console.log('Showing items', startIndex + 1, 'to', endIndex, 'of', totalItems, 'items');
        
        // 各質問アイテムをレンダリング
        currentPageItems.forEach(question => {
            // 質問アイテムのクラスを設定
            let itemClasses = 'question-item';
            if (question.isUnread) itemClasses += ' unread';
            if (question.isPinned) itemClasses += ' pinned';
            
            // HTMLを生成
            const questionHTML = `
                <div class="${itemClasses}" data-id="${question.id}" data-type="${question.type}">
                    <!-- 左側：アイコン -->
                    <div class="question-icon">
                        <span class="badge badge-type badge-${question.type}">${question.type === 'ai' ? 'AI' : '講師'}</span>
                    </div>
                    
                    <!-- 中央：メインコンテンツ -->
                    <div class="question-item-content">
                        <div class="action-path">${question.path}</div>
                        <div class="action-name">${question.name}</div>
                        <div class="message-preview">${question.message}</div>
                    </div>
                    
                    <!-- 右側：日付とオプション -->
                    <div class="question-item-side">
                        <div class="question-date">${question.date}</div>
                        <div class="question-options">
                            <button class="option-btn more-btn" title="その他">
                                <svg class="option-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="5" r="1" />
                                    <circle cx="12" cy="12" r="1" />
                                    <circle cx="12" cy="19" r="1" />
                                </svg>
                            </button>
                            <div class="options-dropdown">
                                <button class="dropdown-item pin-btn">
                                    <svg class="dropdown-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M12 2L12 22M2 12L22 12" />
                                    </svg>
                                    <span>${question.isPinned ? 'ピン留め解除' : 'ピン留め'}</span>
                                </button>
                                <button class="dropdown-item delete-btn">
                                    <svg class="dropdown-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                                    </svg>
                                    <span>削除</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
            
            // リストに追加
            questionList.innerHTML += questionHTML;
        });
        
        // ページネーション情報を更新
        updatePaginationInfo(totalItems, startIndex, endIndex);
        
        // イベントリスナーを設定
        setupQuestionItemListeners();
    }

    // ページネーション情報の更新関数
    function updatePaginationInfo(totalItems, startIndex, endIndex) {
        const startItem = totalItems > 0 ? startIndex + 1 : 0;
        const endItem = endIndex;
        
        // ページネーション情報の更新
        const paginationInfo = document.querySelector('.pagination-info');
        if (paginationInfo) {
            paginationInfo.textContent = `${startItem}-${endItem}/${totalItems}件`;
        }
        
        // ボタンの有効/無効状態の更新
        const prevButton = document.querySelector('.prev-btn');
        const nextButton = document.querySelector('.next-btn');
        
        if (prevButton) {
            prevButton.disabled = currentPage <= 1;
        }
        
        if (nextButton) {
            const maxPage = Math.ceil(totalItems / itemsPerPage);
            nextButton.disabled = currentPage >= maxPage || totalItems === 0;
        }
    }

    // 質問アイテムのイベントリスナーを設定
    function setupQuestionItemListeners() {
        // オプションボタンのクリックイベント
        const moreButtons = document.querySelectorAll('.more-btn');
        moreButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                
                // 他のドロップダウンを閉じる
                document.querySelectorAll('.question-options.active').forEach(item => {
                    if (item !== this.parentElement) {
                        item.classList.remove('active');
                    }
                });
                
                // このドロップダウンを開閉
                this.parentElement.classList.toggle('active');
            });
        });
        
        // ピン留めボタンのクリックイベント
        const pinButtons = document.querySelectorAll('.pin-btn');
        pinButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                
                const questionItem = this.closest('.question-item');
                const questionId = parseInt(questionItem.dataset.id);
                
                // データを更新
                const questionIndex = questionData.findIndex(q => q.id === questionId);
                if (questionIndex !== -1) {
                    questionData[questionIndex].isPinned = !questionData[questionIndex].isPinned;
                    
                    // リストを再レンダリング
                    renderQuestionList();
                }
            });
        });
        
        // 削除ボタンのクリックイベント
        const deleteButtons = document.querySelectorAll('.delete-btn');
        deleteButtons.forEach(button => {
            button.addEventListener('click', function(e) {
                e.stopPropagation();
                
                const questionItem = this.closest('.question-item');
                const questionId = parseInt(questionItem.dataset.id);
                
                // データから削除
                const questionIndex = questionData.findIndex(q => q.id === questionId);
                if (questionIndex !== -1) {
                    questionData.splice(questionIndex, 1);
                    
                    // リストを再レンダリング
                    renderQuestionList();
                    
                    // サイドバーのカウントを更新
                    updateSidebarCounts();
                }
            });
        });
        
        // 質問アイテムのクリックイベント（詳細表示など）
        const questionItems = document.querySelectorAll('.question-item');
        questionItems.forEach(item => {
            item.addEventListener('click', function() {
                const questionId = parseInt(this.dataset.id);
                console.log(`質問ID: ${questionId} がクリックされました`);
                
                // 未読状態を既読に変更
                const questionIndex = questionData.findIndex(q => q.id === questionId);
                if (questionIndex !== -1 && questionData[questionIndex].isUnread) {
                    questionData[questionIndex].isUnread = false;
                    this.classList.remove('unread');
                    
                    // サイドバーのカウントを更新
                    updateSidebarCounts();
                }
            });
        });
    }

    // サイドバーのカウントを更新する関数
    function updateSidebarCounts() {
        const allCount = questionData.length;
        const aiCount = questionData.filter(q => q.type === 'ai').length;
        const instructorCount = questionData.filter(q => q.type === 'instructor').length;
        
        document.querySelector('.sidebar-item[data-filter-type="all"] .sidebar-count').textContent = allCount;
        document.querySelector('.sidebar-item[data-filter-type="ai"] .sidebar-count').textContent = aiCount;
        document.querySelector('.sidebar-item[data-filter-type="instructor"] .sidebar-count').textContent = instructorCount;
    }

    // 質問リストを生成
    renderQuestionList();
    
    // サイドバーのカウントを更新
    updateSidebarCounts();

    // フィルタリング機能
    function setupFilters() {
        // タイプフィルター（全て、AI、講師）
        const typeFilterItems = document.querySelectorAll('.sidebar-item[data-filter-type]');
        typeFilterItems.forEach(item => {
            item.addEventListener('click', function() {
                // アクティブクラスを切り替え
                typeFilterItems.forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                
                const filterType = this.dataset.filterType;
                
                // ページを1に戻す
                currentPage = 1;
                
                // 質問リストを再レンダリング
                renderQuestionList();
            });
        });
    }

    // フィルターを適用する関数
    function applyFilters(type) {
        // フィルタリング条件に基づいて表示するデータを選択
        let filteredData = [...questionData];
        
        if (type !== 'all') {
            filteredData = filteredData.filter(q => q.type === type);
        }
        
        // フィルタリングされたデータでリストを再レンダリング
        renderFilteredQuestionList(filteredData);
    }

    // フィルタリングされた質問リストをレンダリングする関数
    function renderFilteredQuestionList(filteredData) {
        const questionList = document.querySelector('.question-list');
        
        // リストをクリア
        questionList.innerHTML = '';
        
        // フィルタリングされたデータでリストを生成
        filteredData.forEach(question => {
            // 質問アイテムのHTMLを生成（renderQuestionList関数と同様）
            // ...
        });
        
        // イベントリスナーを設定
        setupQuestionItemListeners();
    }

    // 新しい質問を追加する関数
    function addNewQuestion(questionData) {
        // 新しいIDを生成（既存の最大ID + 1）
        const maxId = Math.max(...questionData.map(q => q.id), 0);
        const newId = maxId + 1;
        
        // 新しい質問オブジェクトを作成
        const newQuestion = {
            id: newId,
            type: "ai", // デフォルト値
            path: "新しい質問",
            name: "タイトル未設定",
            message: "質問内容がここに表示されます。",
            date: "たった今",
            isUnread: true,
            isPinned: false
        };
        
        // データに追加
        questionData.unshift(newQuestion); // 先頭に追加
        
        // リストを再レンダリング
        renderQuestionList();
        
        // サイドバーのカウントを更新
        updateSidebarCounts();
        
        return newId; // 新しい質問のIDを返す
    }

    // 質問を編集する関数
    function editQuestion(id, updatedData) {
        const questionIndex = questionData.findIndex(q => q.id === id);
        
        if (questionIndex !== -1) {
            // 既存のデータと更新データをマージ
            questionData[questionIndex] = {
                ...questionData[questionIndex],
                ...updatedData
            };
            
            // リストを再レンダリング
            renderQuestionList();
        }
    }

    // 質問を削除する関数
    function deleteQuestion(id) {
        const questionIndex = questionData.findIndex(q => q.id === id);
        
        if (questionIndex !== -1) {
            // データから削除
            questionData.splice(questionIndex, 1);
            
            // リストを再レンダリング
            renderQuestionList();
            
            // サイドバーのカウントを更新
            updateSidebarCounts();
        }
    }

    // フィルタリングされた質問の数を取得する関数
    function getFilteredQuestionCount() {
        const activeTypeItem = document.querySelector('.sidebar-item[data-filter-type].active');
        const activeType = activeTypeItem ? activeTypeItem.dataset.filterType : 'all';
        
        const instructorStatusSection = document.getElementById('instructorStatusSection');
        const activeStatusItem = document.querySelector('.filter-tab[data-filter-status].active');
        const activeStatus = (instructorStatusSection.style.display === 'none' || !activeStatusItem) ? 'all' : 
                            activeStatusItem.dataset.filterStatus;
        
        // フィルタリング条件に基づいてデータをフィルタリング
        let filteredData = [...questionData];
        
        // タイプフィルター
        if (activeType !== 'all') {
            filteredData = filteredData.filter(q => q.type === activeType);
        }
        
        // ステータスフィルター（講師の場合のみ）
        if (activeType === 'instructor' && activeStatus !== 'all') {
            if (activeStatus === 'unread') {
                filteredData = filteredData.filter(q => q.isUnread);
            } else if (activeStatus === 'read') {
                filteredData = filteredData.filter(q => !q.isUnread);
            }
        }
        
        return filteredData.length;
    }
}); 