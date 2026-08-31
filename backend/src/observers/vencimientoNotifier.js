// Implementación del patrón Observer para las notificaciones de vencimiento.
//
// El "subject" (VencimientoNotifier) no sabe qué hacen los observers con el
// evento; cada observer decide su propia forma de reaccionar (actualizar un
// panel, mandar un email, etc). Esto permite agregar nuevos canales de
// notificación sin tocar la lógica que detecta los vencimientos.

class VencimientoNotifier {
  constructor() {
    this.observers = [];
  }

  suscribir(observer) {
    this.observers.push(observer);
  }

  notificar(alquiler) {
    for (const observer of this.observers) {
      observer.actualizar(alquiler);
    }
  }
}

export const vencimientoNotifier = new VencimientoNotifier();

// Observer para el MVP: solo registra en memoria/log.
// A futuro se suma un EmailObserver sin tocar el resto del sistema.
export const panelObserver = {
  actualizar(alquiler) {
    console.log(`[Panel] Alquiler #${alquiler.id} requiere atención (estado: ${alquiler.estado})`);
  },
};

vencimientoNotifier.suscribir(panelObserver);
