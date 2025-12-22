export enum NotificationType {
  new_message = 'new_message',
  new_review = 'new_review',
  collaboration_sent_by_company = 'collaboration_sent_by_company',
  collaboration_refused_by_influencer = 'collaboration_refused_by_influencer',
  collaboration_canceled_by_company = 'collaboration_canceled_by_company',
  collaboration_waiting_for_company_payment = 'collaboration_waiting_for_company_payment',
  collaboration_in_progress = 'collaboration_in_progress',
  collaboration_pending_company_validation = 'collaboration_pending_company_validation',
  collaboration_done = 'collaboration_done',
}

export const notificationMessages: Record<
  NotificationType,
  { title: string; body: string }
> = {
  [NotificationType.new_message]: {
    title: 'Nouveau message',
    body: 'Vous avez reçu un nouveau message.',
  },
  [NotificationType.new_review]: {
    title: 'Nouvelle évaluation',
    body: 'Vous avez reçu une nouvelle évaluation.',
  },
  [NotificationType.collaboration_sent_by_company]: {
    title: 'Nouvelle collaboration',
    body: 'Une entreprise vous a envoyé une collaboration.',
  },
  [NotificationType.collaboration_refused_by_influencer]: {
    title: 'Collaboration refusée',
    body: "L'influenceur a refusé votre collaboration.",
  },
  [NotificationType.collaboration_canceled_by_company]: {
    title: 'Collaboration annulée',
    body: "L'entreprise a annulé la collaboration.",
  },
  [NotificationType.collaboration_waiting_for_company_payment]: {
    title: 'Paiement en attente',
    body: 'Collaboration en attente de paiement.',
  },
  [NotificationType.collaboration_in_progress]: {
    title: 'Collaboration en cours',
    body: 'Votre collaboration est actuellement en cours.',
  },
  [NotificationType.collaboration_pending_company_validation]: {
    title: 'Validation en attente',
    body: 'Collaboration en attente de validation',
  },
  [NotificationType.collaboration_done]: {
    title: 'Collaboration terminée',
    body: "Une collaboration vient d'être terminée.",
  },
};
