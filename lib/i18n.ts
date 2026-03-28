export type Language = 'en' | 'fil' | 'es'

export const SUPPORTED_LANGUAGES = {
  en: 'English',
  fil: 'Filipino',
  es: 'Español',
} as const

// Translation keys and their translations
export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.myClasses': 'My Classes',
    'nav.grades': 'Grades',
    'nav.attendance': 'Attendance',
    'nav.schedule': 'Schedule',
    'nav.documents': 'Documents',
    'nav.requests': 'Requests',
    'nav.financial': 'Financial',
    'nav.library': 'Library',
    'nav.campusResources': 'Campus Resources',
    'nav.notifications': 'Notifications',
    'nav.feedback': 'Feedback',
    'nav.contactAdmin': 'Contact Admin',

    // Common
    'common.welcome': 'Welcome',
    'common.submit': 'Submit',
    'common.cancel': 'Cancel',
    'common.save': 'Save',
    'common.delete': 'Delete',
    'common.edit': 'Edit',
    'common.back': 'Back',
    'common.next': 'Next',
    'common.prev': 'Previous',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.loading': 'Loading...',
    'common.noData': 'No data found',
    'common.error': 'Error',
    'common.success': 'Success',

    // Financial
    'financial.title': 'Financial Information',
    'financial.tuition': 'Total Tuition',
    'financial.fees': 'Total Fees',
    'financial.paid': 'Total Paid',
    'financial.balance': 'Balance Owed',
    'financial.history': 'Transaction History',
    'financial.dueDate': 'Due Date',
    'financial.paidDate': 'Paid Date',
    'financial.status': 'Status',

    // Library
    'library.title': 'Library Resources',
    'library.searchBooks': 'Search Books',
    'library.catalog': 'Library Catalog',
    'library.checkout': 'Checkout',
    'library.return': 'Return',
    'library.myCheckouts': 'My Checkouts',
    'library.history': 'Return History',
    'library.available': 'Available',

    // Campus
    'campus.title': 'Campus Resources',
    'campus.facilities': 'Facilities',
    'campus.departments': 'Departments',
    'campus.bookings': 'My Bookings',
    'campus.booking': 'Booking',

    // Notifications
    'notif.title': 'Notifications',
    'notif.all': 'All',
    'notif.unread': 'Unread',
    'notif.read': 'Read',
    'notif.archived': 'Archived',
    'notif.markAsRead': 'Mark as Read',
    'notif.archive': 'Archive',

    // Feedback
    'feedback.title': 'Feedback',
    'feedback.submit': 'Submit Feedback',
    'feedback.category': 'Category',
    'feedback.subject': 'Subject',
    'feedback.message': 'Message',
    'feedback.priority': 'Priority',
    'feedback.status': 'Status',
    'feedback.myFeedback': 'My Feedback',
    'feedback.bug': 'Bug Report',
    'feedback.featureRequest': 'Feature Request',
    'feedback.suggestion': 'Suggestion',
    'feedback.complaint': 'Complaint',
    'feedback.general': 'General',

    // Messages
    'msg.successfullySubmitted': 'Successfully submitted',
    'msg.changesSaved': 'Changes saved',
    'msg.deletedSuccessfully': 'Deleted successfully',
    'msg.confirmDelete': 'Are you sure you want to delete this?',
    'msg.fillRequired': 'Please fill in all required fields',
  },
  fil: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.myClasses': 'Ang Aking Mga Klase',
    'nav.grades': 'Mga Marka',
    'nav.attendance': 'Pagdalo',
    'nav.schedule': 'Iskedyul',
    'nav.documents': 'Mga Dokumento',
    'nav.requests': 'Mga Kahilingan',
    'nav.financial': 'Finansyal',
    'nav.library': 'Aklatan',
    'nav.campusResources': 'Mga Pasilidad ng Kampus',
    'nav.notifications': 'Mga Abiso',
    'nav.feedback': 'Feedback',
    'nav.contactAdmin': 'Makipag-ugnayan sa Admin',

    // Common
    'common.welcome': 'Maligayang pagdating',
    'common.submit': 'Ipadala',
    'common.cancel': 'Kanselahin',
    'common.save': 'I-save',
    'common.delete': 'Burahin',
    'common.edit': 'I-edit',
    'common.back': 'Bumalik',
    'common.next': 'Susunod',
    'common.prev': 'Nakaraang',
    'common.search': 'Maghanap',
    'common.filter': 'Salain',
    'common.loading': 'Naglo-load...',
    'common.noData': 'Walang nahanap na datos',
    'common.error': 'Kamalian',
    'common.success': 'Tagumpay',

    // Financial
    'financial.title': 'Impormasyon sa Finansyal',
    'financial.tuition': 'Kabuuang Tuition',
    'financial.fees': 'Kabuuang Bayad',
    'financial.paid': 'Kabuuang Nabayaran',
    'financial.balance': 'Balanseng Utang',
    'financial.history': 'Kasaysayan ng Transaksyon',
    'financial.dueDate': 'Petsa ng Pagkakadugo',
    'financial.paidDate': 'Petsa ng Pagbabayad',
    'financial.status': 'Katayuan',

    // Library
    'library.title': 'Mga Mapagkukunang Aklatan',
    'library.searchBooks': 'Maghanap ng Mga Libro',
    'library.catalog': 'Katalogo ng Aklatan',
    'library.checkout': 'Kunin ang Aklat',
    'library.return': 'Ibalik ang Aklat',
    'library.myCheckouts': 'Ang Aking Mga Kunin',
    'library.history': 'Kasaysayan ng Pagbabalik',
    'library.available': 'Available',

    // Campus
    'campus.title': 'Mga Pasilidad ng Kampus',
    'campus.facilities': 'Mga Pasilidad',
    'campus.departments': 'Mga Departamento',
    'campus.bookings': 'Ang Aking Mga Booking',
    'campus.booking': 'Booking',

    // Notifications
    'notif.title': 'Mga Abiso',
    'notif.all': 'Lahat',
    'notif.unread': 'Hindi Binasa',
    'notif.read': 'Nabasa',
    'notif.archived': 'Naka-archive',
    'notif.markAsRead': 'Markahan bilang Nabasa',
    'notif.archive': 'I-archive',

    // Feedback
    'feedback.title': 'Feedback',
    'feedback.submit': 'Magpadala ng Feedback',
    'feedback.category': 'Kategorya',
    'feedback.subject': 'Paksa',
    'feedback.message': 'Mensahe',
    'feedback.priority': 'Priyoridad',
    'feedback.status': 'Katayuan',
    'feedback.myFeedback': 'Ang Aking Feedback',
    'feedback.bug': 'Bug Report',
    'feedback.featureRequest': 'Hiling ng Feature',
    'feedback.suggestion': 'Mungkahi',
    'feedback.complaint': 'Reklamo',
    'feedback.general': 'Pangkalahatan',

    // Messages
    'msg.successfullySubmitted': 'Matagumpay na ipadala',
    'msg.changesSaved': 'Nakatipid ang mga pagbabago',
    'msg.deletedSuccessfully': 'Matagumpay na nabura',
    'msg.confirmDelete': 'Sigurado ka na bang gusto mong burahin ito?',
    'msg.fillRequired': 'Mangyaring punan ang lahat ng kinakailangang larangan',
  },
  es: {
    // Navigation
    'nav.dashboard': 'Panel de control',
    'nav.myClasses': 'Mis Clases',
    'nav.grades': 'Calificaciones',
    'nav.attendance': 'Asistencia',
    'nav.schedule': 'Horario',
    'nav.documents': 'Documentos',
    'nav.requests': 'Solicitudes',
    'nav.financial': 'Financiero',
    'nav.library': 'Biblioteca',
    'nav.campusResources': 'Recursos del Campus',
    'nav.notifications': 'Notificaciones',
    'nav.feedback': 'Retroalimentación',
    'nav.contactAdmin': 'Contactar Administrador',

    // Common
    'common.welcome': 'Bienvenido',
    'common.submit': 'Enviar',
    'common.cancel': 'Cancelar',
    'common.save': 'Guardar',
    'common.delete': 'Eliminar',
    'common.edit': 'Editar',
    'common.back': 'Atrás',
    'common.next': 'Siguiente',
    'common.prev': 'Anterior',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.loading': 'Cargando...',
    'common.noData': 'No se encontraron datos',
    'common.error': 'Error',
    'common.success': 'Éxito',

    // Financial
    'financial.title': 'Información Financiera',
    'financial.tuition': 'Matrícula Total',
    'financial.fees': 'Tarifas Totales',
    'financial.paid': 'Total Pagado',
    'financial.balance': 'Saldo Adeudado',
    'financial.history': 'Historial de Transacciones',
    'financial.dueDate': 'Fecha de Vencimiento',
    'financial.paidDate': 'Fecha de Pago',
    'financial.status': 'Estado',

    // Library
    'library.title': 'Recursos de Biblioteca',
    'library.searchBooks': 'Buscar Libros',
    'library.catalog': 'Catálogo de Biblioteca',
    'library.checkout': 'Retirar',
    'library.return': 'Devolver',
    'library.myCheckouts': 'Mis Préstamos',
    'library.history': 'Historial de Devoluciones',
    'library.available': 'Disponible',

    // Campus
    'campus.title': 'Recursos del Campus',
    'campus.facilities': 'Instalaciones',
    'campus.departments': 'Departamentos',
    'campus.bookings': 'Mis Reservas',
    'campus.booking': 'Reserva',

    // Notifications
    'notif.title': 'Notificaciones',
    'notif.all': 'Todas',
    'notif.unread': 'No Leído',
    'notif.read': 'Leído',
    'notif.archived': 'Archivado',
    'notif.markAsRead': 'Marcar como Leído',
    'notif.archive': 'Archivar',

    // Feedback
    'feedback.title': 'Retroalimentación',
    'feedback.submit': 'Enviar Retroalimentación',
    'feedback.category': 'Categoría',
    'feedback.subject': 'Asunto',
    'feedback.message': 'Mensaje',
    'feedback.priority': 'Prioridad',
    'feedback.status': 'Estado',
    'feedback.myFeedback': 'Mi Retroalimentación',
    'feedback.bug': 'Reporte de Error',
    'feedback.featureRequest': 'Solicitud de Función',
    'feedback.suggestion': 'Sugerencia',
    'feedback.complaint': 'Queja',
    'feedback.general': 'General',

    // Messages
    'msg.successfullySubmitted': 'Enviado exitosamente',
    'msg.changesSaved': 'Cambios guardados',
    'msg.deletedSuccessfully': 'Eliminado exitosamente',
    'msg.confirmDelete': '¿Está seguro de que desea eliminar esto?',
    'msg.fillRequired': 'Por favor, complete todos los campos requeridos',
  },
}

// Get translation key
export const t = (key: string, lang: Language = 'en'): string => {
  return translations[lang][key] || key
}

// Get language from localStorage
export const getStoredLanguage = (): Language => {
  if (typeof window === 'undefined') return 'en'
  const stored = localStorage.getItem('language')
  return (stored as Language) || 'en'
}

// Set language to localStorage
export const setStoredLanguage = (lang: Language): void => {
  if (typeof window === 'undefined') return
  localStorage.setItem('language', lang)
}
