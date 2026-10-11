import { Suspense } from 'react';
import Hero from './blocks/Hero';
import FeatureCards from './blocks/FeatureCards';
import UseCase from './blocks/UseCase';
import ComparisonTable from './blocks/ComparisonTable';
import Faq from './blocks/Faq';
import CtaBand from './blocks/CtaBand';
import RichText from './blocks/RichText';
import Notice from './blocks/Notice';
import LogoStrip from './blocks/LogoStrip';
import IntegrationGrid from './blocks/IntegrationGrid';
import PlanCards from './blocks/PlanCards';
import { getIntegrations, imageProps, mediaUrl } from '@/lib/strapi';

const STATIC = {
  'blocks.hero': Hero,
  'blocks.feature-cards': FeatureCards,
  'blocks.use-case': UseCase,
  'blocks.comparison-table': ComparisonTable,
  'blocks.faq': Faq,
  'blocks.cta-band': CtaBand,
  'blocks.rich-text': RichText,
  'blocks.notice': Notice,
  'blocks.logo-strip': LogoStrip,
};

/** Renders a Strapi dynamic zone. Unknown block types are skipped. */
export default async function Blocks({ blocks, locale, t, searchParams = {} }) {
  if (!blocks?.length) return null;
  const needsIntegrations = blocks.some((b) => b.__component === 'blocks.integration-grid' || b.__component === 'blocks.plan-cards');
  const integrations = needsIntegrations
    ? (await getIntegrations(locale)).map((i) => ({
        slug: i.slug, system: i.system, category: i.category, stage: i.stage, summary: i.summary,
        logoUrl: mediaUrl(i.logo), screenshot: imageProps(i.screenshot), release: i.release ? { version: i.release.version } : null,
      }))
    : [];

  return blocks.map((block) => {
    const key = `${block.__component}-${block.id}`;
    if (block.__component === 'blocks.integration-grid') {
      return <IntegrationGrid key={key} block={block} integrations={integrations} locale={locale} t={t} initialCategory={searchParams.category} />;
    }
    if (block.__component === 'blocks.plan-cards') {
      return (
        <Suspense key={key}>
          <PlanCards block={block} integrations={integrations} locale={locale} t={t} />
        </Suspense>
      );
    }
    const Component = STATIC[block.__component];
    return Component ? <Component key={key} block={block} locale={locale} t={t} /> : null;
  });
}
