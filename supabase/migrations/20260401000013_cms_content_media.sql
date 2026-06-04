-- CMS content seeds (page heroes, programs body) + media library folder alignment
-- Idempotent: safe on db push / reset. Does not overwrite existing site_content rows.

-- ---------------------------------------------------------------------------
-- Media library: backfill folder from storage path prefix
-- ---------------------------------------------------------------------------
UPDATE public.media_assets
SET folder = split_part(path, '/', 1)
WHERE folder = 'general'
  AND split_part(path, '/', 1) IN ('cms', 'gallery', 'resources', 'uploads');

UPDATE public.media_assets
SET folder = 'uploads'
WHERE folder = 'general'
  AND path LIKE 'uploads/%';

ALTER TABLE public.media_assets DROP CONSTRAINT IF EXISTS media_assets_folder_check;
ALTER TABLE public.media_assets
  ADD CONSTRAINT media_assets_folder_check
  CHECK (folder IN ('cms', 'gallery', 'resources', 'uploads', 'general'));

CREATE INDEX IF NOT EXISTS media_assets_mime_type_idx ON public.media_assets (mime_type);

-- Public read for gallery/API consumers (staff writes unchanged)
DROP POLICY IF EXISTS media_read ON public.media_assets;
CREATE POLICY media_read ON public.media_assets
  FOR SELECT TO anon, authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- site_content: inner page heroes (Admin → Page heroes)
-- ---------------------------------------------------------------------------
INSERT INTO public.site_content (key, value) VALUES
  (
    'page.about.hero.v1',
    '{"badge":"About","heading":"Who we are and why TEN exists","description":"The Ember Network is a transformative hub for emerging entrepreneurs, turning ambitious ideas into thriving enterprises through mentorship and strategic guidance.","image":"/assets/images/1519389950473-47ba0277781c.jpg"}'::jsonb
  ),
  (
    'page.programs.hero.v1',
    '{"badge":"Programs","heading":"From spark to scale","description":"Structured programs and experiences that move founders from ideation to impact — through workshops, pitch challenges, mentorship circles, and the entrepreneurial growth cycle.","image":"/assets/images/1498050108023-c5249f4df085.jpg"}'::jsonb
  ),
  (
    'page.resources.hero.v1',
    '{"badge":"Resources","heading":"Practical guides for purposeful growth","description":"Explore actionable playbooks, templates, and mentorship notes to help you move from idea to measurable progress.","image":"/assets/images/1454165804606-c3d57bc86b40.jpg"}'::jsonb
  ),
  (
    'page.contact.hero.v1',
    '{"badge":"Contact","heading":"Contact The Ember Network","description":"Reach out for membership support, mentor collaboration, and strategic partnerships within TEN.","image":"/assets/images/1517048676732-d65bc937f952.jpg"}'::jsonb
  ),
  (
    'page.gallery.hero.v1',
    '{"badge":"Gallery","heading":"Moments from the network","description":"Watch program highlights and browse photo albums from events, mentorship sessions, and community gatherings.","image":"/assets/images/1531123897727-8f129e1688ce.jpg"}'::jsonb
  ),
  (
    'page.community.hero.v1',
    '{"badge":"Community","heading":"Who Can Join TEN","description":"TEN brings together aspiring entrepreneurs, early-stage founders, and experts in one collaborative ecosystem — built for ambitious individuals ready to learn, collaborate, and grow.","image":"/assets/images/1529156069898-49953e39b3ac.jpg"}'::jsonb
  )
ON CONFLICT (key) DO NOTHING;

-- ---------------------------------------------------------------------------
-- site_content: programs page cards + growth cycle (Admin → Programs)
-- ---------------------------------------------------------------------------
INSERT INTO public.site_content (key, value) VALUES (
  'page.programs.content.v1',
  $json$
{
  "cards_section": {
    "eyebrow": "Program Cards",
    "title": "How We Build Our Founders",
    "body": "The Ember Network combines mentorship, practical learning and collaborative experiences to help entrepreneurs move confidently from idea to execution."
  },
  "cards": [
    {
      "id": "ignition-labs",
      "icon": "beaker",
      "title": "Ignition Labs",
      "tagline": "Build the foundation behind bold ideas.",
      "description": "Hands-on workshops designed to equip founders with practical skills in strategy, branding, finance, product development and business growth. From idea validation to execution, members gain the tools needed to transform vision into viable ventures.",
      "image": "/assets/images/1454165804606-c3d57bc86b40.jpg",
      "image_alt": "Founders in a hands-on workshop session",
      "video": ""
    },
    {
      "id": "spark-challenge",
      "icon": "bolt",
      "title": "Spark Challenge",
      "tagline": "Where innovation meets opportunity.",
      "description": "Competitive pitch experiences that sharpen ideas, build confidence and expose founders to expert feedback and recognition. Members learn how to communicate their vision with clarity, confidence and purpose.",
      "image": "/assets/images/1542744173-8e7e53415bb0.jpg",
      "image_alt": "Founder pitching to a panel of judges",
      "video": ""
    },
    {
      "id": "fireside-dialogues",
      "icon": "mic",
      "title": "Fireside Dialogues",
      "tagline": "Real stories. Real lessons. Real access.",
      "description": "Exclusive conversations with accomplished entrepreneurs, investors and industry leaders sharing insights, failures and breakthrough moments. Designed to inspire meaningful connections and practical learning.",
      "image": "/assets/images/1573496359142-b8d87734a5a2.jpg",
      "image_alt": "Speaker sharing insights at a fireside dialogue",
      "video": ""
    },
    {
      "id": "founder-mastermind",
      "icon": "users",
      "title": "Founder Mastermind",
      "tagline": "Growth happens in community.",
      "description": "Collaborative circles where founders discuss challenges, exchange ideas and receive strategic feedback from mentors and peers. Accountability and collaboration become catalysts for sustainable growth.",
      "image": "/assets/images/1520607162513-77705c0f0d4a.jpg",
      "image_alt": "Founders collaborating in a mastermind circle",
      "video": ""
    },
    {
      "id": "impact-ventures",
      "icon": "globe",
      "title": "Impact Ventures",
      "tagline": "Build businesses that create meaningful change.",
      "description": "Members develop entrepreneurial solutions that combine innovation with social impact, empowering communities while building sustainable ventures. Because successful businesses should also create lasting value.",
      "image": "/assets/images/1573496774426-fe3db3dd1731.jpg",
      "image_alt": "Entrepreneur leading an impact-focused venture",
      "video": ""
    }
  ],
  "growth_section": {
    "eyebrow": "From Spark to Scale",
    "title": "The Entrepreneurial Growth Cycle",
    "body": "A structured journey designed to move founders from ideation to impact."
  },
  "growth_stages": [
    {
      "id": "weekly-momentum",
      "num": "01",
      "stage": "Stage 1",
      "title": "Weekly Momentum",
      "tagline": "Learn. Build. Present. Improve.",
      "description": "Members complete weekly entrepreneurial tasks focused on ideation, research, business models and strategy development. Peer reviews and presentations encourage accountability, collaboration and continuous improvement.",
      "image": "/assets/images/1454165804606-c3d57bc86b40.jpg",
      "image_alt": "Weekly planning and collaboration",
      "video": ""
    },
    {
      "id": "monthly-immersion",
      "num": "02",
      "stage": "Stage 2",
      "title": "Monthly Immersion",
      "tagline": "Workshops. Mentorship. Networking.",
      "description": "Interactive monthly sessions bring members together for expert-led workshops, progress reviews and meaningful networking experiences. Founders gain personalized feedback while refining their business approaches.",
      "image": "/assets/images/1552664730-d307ca884978.jpg",
      "image_alt": "Monthly mentor workshop",
      "video": ""
    },
    {
      "id": "quarterly-elevation",
      "num": "03",
      "stage": "Stage 3",
      "title": "Quarterly Elevation",
      "tagline": "Exposure. Impact. Transformation.",
      "description": "Quarterly pitch experiences, masterclasses and innovation challenges help founders showcase growth, attract opportunities and develop scalable solutions. Members are encouraged to integrate social impact into their entrepreneurial journeys.",
      "image": "/assets/images/1542744173-05336fcc7ad4.jpg",
      "image_alt": "Quarterly pitch and progress review",
      "video": ""
    }
  ]
}
$json$::jsonb
)
ON CONFLICT (key) DO NOTHING;
