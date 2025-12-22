/**
 * PDFKitService
 *
 * In this project, invoices are handled by Stripe.
 * Originally, PDF generation for contracts was not planned.
 * However, following a last-minute pre-production request, PDFKit was integrated
 * to generate collaboration contracts between companies and influencers.
 *
 * The contract template was assisted by AI, while keeping the implementation
 * simple and maintainable.
 */

import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { CompanyEntity } from '../entities/company.entity';
import { InfluencerEntity } from '../entities/influencer.entity';
import { CollaborationEntity } from '../entities/collaboration.entity';
import { InstagramAccountEntity } from 'src/modules/facebook/entities/instagram_account.entity';
import { kCommission } from 'src/commons/constants';

@Injectable()
export class PDFKitService {
  /**
   * Generates a collaboration contract PDF between a company and an influencer.
   * Returns the PDF as a Buffer.
   */
  async generateContract(
    company: CompanyEntity,
    influencer: InfluencerEntity,
    collaboration: CollaborationEntity,
    instagramAccount: InstagramAccountEntity,
  ): Promise<Buffer> {
    const doc = new PDFDocument({ margin: 50 });
    const buffers: Buffer[] = [];
    doc.on('data', (chunk) => buffers.push(chunk));

    // === Base data ===
    const address =
      `${company.street ?? ''}, ${company.postalCode ?? ''} ${company.city ?? ''}`.trim();
    const representativeName =
      `${company.firstnameRepresentative ?? ''} ${company.lastnameRepresentative ?? ''}`.trim();
    const placements = collaboration.productPlacements ?? [];
    const basePrice = collaboration.getPrice();
    const hasInfluencerVAT = influencer.vatNumber !== null;

    // === Financial logic ===
    const commission = basePrice * kCommission;
    const rocinyVAT = commission * 0.2;
    const influencerVAT = hasInfluencerVAT ? basePrice * 0.2 : 0;
    const total = basePrice + influencerVAT + commission + rocinyVAT;
    const commissionPercent = (kCommission * 100).toFixed(0);

    const contractDate = collaboration.createdAt.toLocaleDateString('fr-FR');
    const validationDate = new Date().toLocaleDateString('fr-FR');

    // === HEADER ===
    doc
      .fontSize(18)
      .text('CONTRAT DE COLLABORATION PUBLICITAIRE', { align: 'center' });
    doc.moveDown(2);

    // === PARTIES ===
    doc.fontSize(12);
    doc.text('ENTRE :', { underline: true });
    doc.moveDown(0.5);
    doc.text(`${company.name}`);
    doc.text(`Immatriculée sous le numéro ${company.siret}`);
    doc.text(`Siège : ${address}`);
    doc.text(`Représentée par ${representativeName}`);
    doc.text(`(ci-après dénommée "l'Annonceur")`);
    doc.moveDown(1);

    doc.text('ET :', { underline: true });
    doc.moveDown(0.5);
    doc.text(`${influencer.name}`);
    if (influencer.siret)
      doc.text(`Immatriculée sous le numéro ${influencer.siret}`);
    doc.text(`Opérant via le compte Instagram @${instagramAccount.username}`);
    doc.text(`(ci-après dénommé "l'Influenceur")`);
    doc.moveDown(1);

    doc.text(
      `Sous l'intermédiaire de la plateforme Rociny, opérée par Rociny SAS, ` +
        `immatriculée au RCS de Nanterre sous le numéro 930621503, qui facilite ` +
        `la mise en relation, la contractualisation et le paiement des collaborations.`,
    );
    doc.moveDown(2);

    // === ARTICLE 1 ===
    doc.fontSize(14).text('Article 1 - Objet du contrat', { underline: true });
    doc.moveDown(0.5);
    doc
      .fontSize(12)
      .text(
        `Le présent contrat a pour objet de formaliser les engagements réciproques ` +
          `de l'Annonceur et de l'Influenceur dans le cadre d'une collaboration promotionnelle, ` +
          `consistant en la création et la publication de contenus sponsorisés sur le compte Instagram ` +
          `de l'Influenceur, dans les conditions suivantes.`,
      );
    doc.moveDown(2);

    // === ARTICLE 2 ===
    doc
      .fontSize(14)
      .text('Article 2 - Contenu de la collaboration', { underline: true });
    doc.moveDown(0.5);
    doc
      .fontSize(12)
      .text(
        `L'Annonceur mandate l'Influenceur pour la publication du/des contenus suivants :`,
      );
    doc.moveDown(1);
    placements.forEach((p, i) => {
      doc
        .text(`• Placement ${i + 1}`)
        .text(`  - Nature du placement : ${p.type}`)
        .text(`  - Nombre : ${p.quantity}`)
        .text(`  - Description : ${p.description}`)
        .moveDown(0.8);
    });
    doc.text(
      `Le contenu doit être créé par l'Influenceur, puis soumis via Rociny à l'Annonceur pour validation préalable.`,
    );
    doc.moveDown(2);

    // === ARTICLE 3 ===
    doc
      .fontSize(14)
      .text('Article 3 - Validation du contenu', { underline: true });
    doc.moveDown(0.5);
    doc
      .fontSize(12)
      .text(
        `L'Influenceur s'engage à soumettre le contenu à l'Annonceur avant toute publication. ` +
          `Une fois validé via la plateforme Rociny :`,
      );
    doc.list([
      `l'Influenceur est tenu de publier le contenu tel que validé ;`,
      `l'Annonceur ne peut revenir sur sa validation, sauf en cas de violation manifeste de la loi.`,
    ]);
    doc.text(
      `L'historique des validations est horodaté sur Rociny et fait foi entre les Parties.`,
    );
    doc.moveDown(2);

    // === ARTICLE 4 ===
    doc.fontSize(14).text('Article 4 - Rémunération et commission Rociny', {
      underline: true,
    });
    doc.moveDown(0.5);
    doc.fontSize(12);
    doc.text(
      `Montant de la prestation : ${basePrice.toFixed(2)} € HT, payable via Rociny.`,
    );
    doc.text(
      `Commission Rociny : ${commissionPercent}% (${commission.toFixed(2)} €)`,
    );
    if (hasInfluencerVAT)
      doc.text(`TVA Influenceur (20%) : ${influencerVAT.toFixed(2)} €`);
    else doc.text(`TVA Influenceur : Non applicable`);
    doc.text(`TVA Rociny (20%) : ${rocinyVAT.toFixed(2)} €`);
    doc.moveDown(0.5);
    doc.text(`Total TTC : ${total.toFixed(2)} €`);
    doc.moveDown(1);
    doc.text(
      `Rociny perçoit automatiquement la commission, déduite via Stripe Connect. ` +
        `Le solde net est reversé à l'Influenceur une fois la collaboration marquée comme "terminée".`,
    );
    doc.moveDown(2);

    // === ARTICLE 5 ===
    doc
      .fontSize(14)
      .text('Article 5 - Propriété intellectuelle', { underline: true });
    doc.moveDown(0.5);
    doc
      .fontSize(12)
      .text(
        `L'Influenceur conserve les droits sur les contenus créés. Toutefois, il accorde à l'Annonceur ` +
          `une licence non exclusive et temporaire d'utilisation du contenu validé à des fins de repost ` +
          `ou republication sur ses réseaux sociaux pendant une durée de 6 mois, sauf accord étendu.`,
      );
    doc.moveDown(2);

    // === ARTICLE 6 ===
    doc
      .fontSize(14)
      .text('Article 6 - Obligations des Parties', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12).text("L'Annonceur s'engage à :");
    doc.list([
      `Fournir un brief clair,`,
      `Valider ou refuser le contenu dans les délais,`,
      `Ne pas exiger la modification d'un contenu validé.`,
    ]);
    doc.moveDown(1);
    doc.text("L'Influenceur s'engage à :");
    doc.list([
      `Créer un contenu original,`,
      `Respecter le brief,`,
      `Publier dans le délai convenu après validation.`,
    ]);
    doc.moveDown(2);

    // === ARTICLE 7 ===
    doc.fontSize(14).text('Article 7 - Confidentialité', { underline: true });
    doc.moveDown(0.5);
    doc
      .fontSize(12)
      .text(
        `Les informations échangées entre les Parties dans le cadre de la collaboration sont confidentielles ` +
          `et ne peuvent être divulguées à des tiers, sauf obligation légale.`,
      );
    doc.moveDown(2);

    // === ARTICLE 8 ===
    doc.fontSize(14).text('Article 8 - Litiges', { underline: true });
    doc.moveDown(0.5);
    doc
      .fontSize(12)
      .text(
        `Tout litige sera tenté d'être résolu à l'amiable via Rociny. ` +
          `En cas d'échec, les Parties reconnaissent la compétence exclusive du Tribunal Judiciaire de Nanterre.`,
      );
    doc.moveDown(2);

    // === ARTICLE 9 ===
    doc
      .fontSize(14)
      .text('Article 9 - Dispositions générales', { underline: true });
    doc.moveDown(0.5);
    doc
      .fontSize(12)
      .text(
        `Le présent contrat est conclu intuitu personae. Il ne peut être cédé sans accord écrit. ` +
          `Chaque Partie certifie exercer son activité professionnelle conformément aux lois et obligations fiscales applicables.`,
      );
    doc.moveDown(2);

    // === SIGNATURE ===
    doc
      .fontSize(14)
      .text('Signature électronique et preuve', { underline: true });
    doc.moveDown(0.5);
    doc
      .fontSize(12)
      .text(
        `Les Parties reconnaissent que la validation opérée via la plateforme Rociny ` +
          `vaut signature électronique au sens du règlement (UE) n°910/2014 (eIDAS) ` +
          `et de l'article 1367 du Code civil. Le présent contrat est signé en ligne ` +
          `par validation explicite sur Rociny et horodaté. L'historique de validation ` +
          `(identité du compte, horodatage et identifiant de session) fait foi entre les Parties.`,
      );
    doc.moveDown(2);

    // === SIGNATURES ===
    doc
      .fontSize(14)
      .text('Fait en version électronique via Rociny', { align: 'center' });
    doc.moveDown(1.5);
    doc.fontSize(12);
    doc.text(`Date du contrat : ${contractDate}`);
    doc.moveDown(1);
    doc.text(`L'Annonceur : ${representativeName}`);
    doc.text(`Validation : via Rociny`);
    doc.text(`Date : ${validationDate}`);
    doc.moveDown(1);
    doc.text(`L'Influenceur : ${influencer.name}`);
    doc.text(`Validation : via Rociny`);
    doc.text(`Date : ${validationDate}`);

    doc.end();

    return new Promise((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(buffers)));
    });
  }
}
