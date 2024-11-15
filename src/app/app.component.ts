import { Component, OnInit } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  constructor(private swUpdate: SwUpdate) {}

  ngOnInit() {
    // Verificar si estamos en un entorno de navegador antes de ejecutar
    if (this.isBrowser()) {
      this.registrarServiceWorker();
      this.verificarActualizaciones();
      this.configurarPushNotifications();
    }
  }

  // Método para verificar si estamos en el navegador
  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof navigator !== 'undefined';
  }

  private registrarServiceWorker() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/ngsw-worker.js')
        .then(reg => console.log('Service Worker registrado:', reg))
        .catch(err => console.error('Error al registrar el Service Worker:', err));
    } else {
      console.error('Service Worker no soportado en este navegador');
    }
  }

  private verificarActualizaciones() {
    if (this.swUpdate.isEnabled) {
      this.swUpdate.versionUpdates
        .pipe(filter((evt): evt is VersionReadyEvent => evt.type === 'VERSION_READY'))
        .subscribe(() => {
          if (confirm('Hay una nueva versión disponible. ¿Desea cargarla?')) {
            window.location.reload();
          } else {
            // Opción para descargar la actualización
            if (confirm('¿Desea descargar la actualización para instalarla más tarde?')) {
              this.swUpdate.activateUpdate().then(() => {
                console.log('Actualización descargada con éxito.');
              }).catch(err => {
                console.error('Error al descargar la actualización:', err);
              });
            }
          }
        });
    }
  }

  private configurarPushNotifications() {
    if ('PushManager' in window) {
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(subscription => {
          if (!subscription) {
            registration.pushManager.subscribe({
              userVisibleOnly: true,
              applicationServerKey: this.urlBase64ToUint8Array('BJLeEI8V8lKRn3T_87ISG8WrtxpTBO7moWb_8KGwU7k3rpBLLstiRJhJH9lT8rEXlH_jyokdkWNiEqynL9AK1CA') // Reemplazar por tu clave pública VAPID
            }).then(newSubscription => {
              console.log('Suscripción a notificaciones push realizada con éxito.');
            }).catch(err => {
              console.error('Error al suscribirse a notificaciones push:', err);
            });
          } else {
            console.log('Ya está suscrito a notificaciones push.');
          }
        });
      });
    } else {
      console.error('PushManager no está disponible en este navegador');
    }
  }

  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }


}
