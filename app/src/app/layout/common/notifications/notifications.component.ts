        import {
            ChangeDetectionStrategy,
            ChangeDetectorRef,
            Component,
            OnDestroy,
            OnInit,
            TemplateRef,
            ViewChild,
            ViewContainerRef,
            ViewEncapsulation,
        } from '@angular/core';
        import { Overlay, OverlayRef } from '@angular/cdk/overlay';
        import { TemplatePortal } from '@angular/cdk/portal';
        import { MatButton } from '@angular/material/button';
        import { Subject, takeUntil } from 'rxjs';
        import { Notification } from 'app/layout/common/notifications/notifications.types';
        import { NotificationsService } from 'app/layout/common/notifications/notifications.service';

        @Component({
            selector: 'notifications',
            templateUrl: './notifications.component.html',
            encapsulation: ViewEncapsulation.None,
            changeDetection: ChangeDetectionStrategy.OnPush,
            exportAs: 'notifications',
        })
        export class NotificationsComponent implements OnInit, OnDestroy {
            @ViewChild('notificationsOrigin', { static: true }) private _notificationsOrigin: MatButton;
            @ViewChild('notificationsPanel', { static: true }) private _notificationsPanel: TemplateRef<any>;

            notifications: Notification[] = [];
            unreadCount: number = 0;
            private _overlayRef: OverlayRef;
            private _unsubscribeAll: Subject<any> = new Subject<any>();

            constructor(
                private _changeDetectorRef: ChangeDetectorRef,
                private _notificationsService: NotificationsService,
                private _overlay: Overlay,
                private _viewContainerRef: ViewContainerRef
            ) {}

          ngOnInit(): void {
    this._notificationsService
        .getAll()
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe((apiResponse: any) => {
            // Memfilter hanya notifikasi yang belum dibaca
            this.notifications = apiResponse.content
                .filter((notification) => !notification.isRead) // Filter notifikasi yang belum dibaca
                .map((notification) => ({
                    id: notification.id,
                    title: notification.title,
                    description: notification.message,
                    read: notification.isRead,
                    time: this._formatDate(notification.timestamp),
                    link: notification.actionDetail
                        ? `/some/link/${notification.actionDetail}`
                        : '',
                    icon: 'heroicons_outline:bell',
                    image: '',
                }));

            this._calculateUnreadCount();
            this._changeDetectorRef.markForCheck();
        });
}


            private _formatDate(timestamp: string): string {
                const [datePart, timePart] = timestamp.split(' ');
                const formattedDate = `${datePart.slice(0, 4)}-${datePart.slice(4, 6)}-${datePart.slice(6, 8)}`;
                const validTimestamp = `${formattedDate}T${timePart}`;
                const date = new Date(validTimestamp);
                if (isNaN(date.getTime())) {
                    return 'Invalid Date';
                }
                return date.toLocaleString();
            }

            ngOnDestroy(): void {
                this._unsubscribeAll.next(null);
                this._unsubscribeAll.complete();
                if (this._overlayRef) {
                    this._overlayRef.dispose();
                }
            }

            openPanel(): void {
                if (!this._notificationsPanel || !this._notificationsOrigin) {
                    return;
                }
                if (!this._overlayRef) {
                    this._createOverlay();
                }
                this._overlayRef.attach(
                    new TemplatePortal(this._notificationsPanel, this._viewContainerRef)
                );
            }

            closePanel(): void {
                if (this._overlayRef && this._overlayRef.hasAttached()) {
                    this._overlayRef.detach();
                }
            }

            markAllAsRead(): void {
                this._notificationsService.markAllAsRead().subscribe(() => {
                    this.notifications.forEach((notification) => (notification.read = true));
                    this._calculateUnreadCount();
                    this._changeDetectorRef.markForCheck();
                });
            }

        markAsRead(notification: Notification): void {
            if (notification && notification.id !== undefined) {
                this._notificationsService.markAsRead(notification.id).subscribe((response) => {
                    if (response.success) {
                        notification.read = true;
                        this._calculateUnreadCount();
                        this._changeDetectorRef.markForCheck();
                    } else {
                        console.error('Failed to mark notification as read');
                    }
                });
            } else {
                console.error('Notification ID is undefined', notification);
            }
        }



        trackByFn(index: number, notification: Notification): number {
            return notification.id;
        }

        

            private _createOverlay(): void {
                this._overlayRef = this._overlay.create({
                    hasBackdrop: true,
                    backdropClass: 'cdk-overlay-transparent-backdrop',
                    scrollStrategy: this._overlay.scrollStrategies.block(),
                    positionStrategy: this._overlay
                        .position()
                        .flexibleConnectedTo(this._notificationsOrigin._elementRef)
                        .withPositions([
                            {
                                originX: 'center',
                                originY: 'bottom',
                                overlayX: 'center',
                                overlayY: 'top',
                                offsetY: 8,
                            },
                        ]),
                });

                this._overlayRef.backdropClick().subscribe(() => this.closePanel());
            }

            private _calculateUnreadCount(): void {
                if (this.notifications && this.notifications.length) {
                    this.unreadCount = this.notifications.filter((n) => !n.read).length;
                }
            }
        }
