import React from 'react';
import { motion } from 'framer-motion';

export const ComplexSystems: React.FC = () => {
  const cards = [
    {
      title: 'Frontend',
      technologies: 'React, Next.js, Vue, Angular, Svelte, static bundles',
      description: 'Parses DOM bindings, view components, routing directories, and client-side module loaders.'
    },
    {
      title: 'Backend',
      technologies: 'Node.js, Go, Python, Java, Rust, Express, FastAPI',
      description: 'Maps server entrypoints, execution handlers, controllers, middlewares, and server frameworks.'
    },
    {
      title: 'APIs',
      technologies: 'REST controllers, GraphQL endpoints, Internal RPC interfaces',
      description: 'Traces endpoints routes, parameter validation schemas, service layers, and inter-service HTTP requests.'
    },
    {
      title: 'Databases',
      technologies: 'PostgreSQL, MySQL, MongoDB, Redis, schema drivers',
      description: 'Resolves schema models, connection drivers, database triggers, and ORM/raw query definitions.'
    },
    {
      title: 'Infrastructure',
      technologies: 'Message queues, worker pools, cloud tasks, external integrations',
      description: 'Tracks event handlers, background processors, stripe webhooks, and pub/sub queues.'
    },
    {
      title: 'Dependencies',
      technologies: 'Static imports, dynamic requires, package registry manifests',
      description: 'Analyzes imports metadata, package manifests, internal module calls, and external library trees.'
    }
  ];

  return (
    <section className="relative py-12 md:py-16 bg-[#F7F7F5] border-t border-black/[0.035] content-layer" id="systems">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-center max-w-2xl mx-auto mb-16 md:mb-20"
        >
          <span className="text-xs font-sans font-bold uppercase tracking-wider text-neutral-400 block mb-4">
            System Compatibility
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-sans font-normal tracking-tight text-neutral-900 leading-[1.12] mb-6">
            Designed to understand modern software architectures.
          </h2>
          <p className="text-neutral-500 text-sm sm:text-base leading-relaxed">
            Nexora maps codebase dependencies by compiling static Abstract Syntax Trees (AST) and parsing import/export manifests directly.
          </p>
        </motion.div>

        {/* Systems Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {cards.map((card, idx) => (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.15 }}
              transition={{
                duration: 0.5,
                delay: idx * 0.08,
                ease: [0.16, 1, 0.3, 1]
              }}
              whileHover={{ y: -4 }}
              className="bg-white border border-black/[0.045] hover:border-black/[0.09] rounded-2xl p-6 sm:p-7 shadow-[0_2px_8px_rgba(0,0,0,0.01)] hover:shadow-[0_16px_32px_rgba(0,0,0,0.04)] transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <h3 className="font-serif font-semibold text-neutral-900 text-lg sm:text-xl mb-3">
                  {card.title}
                </h3>
                <div className="text-xs sm:text-sm font-serif font-medium text-white bg-blue-600 rounded-md px-3 py-1.5 mb-4 inline-block leading-snug shadow-xs">
                  {card.technologies}
                </div>
                <p className="text-neutral-600 text-sm sm:text-base leading-relaxed font-serif">
                  {card.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};
export default ComplexSystems;
