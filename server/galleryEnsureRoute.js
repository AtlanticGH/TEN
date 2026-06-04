/**
 * Ensures gallery CMS page + hero / video_gallery / gallery blocks exist.
 * Registered from server/index.js so the route is always available on API startup.
 */

const DEFAULT_GALLERY_ALBUMS = [
  {
    title: 'Community gatherings',
    caption: 'Events & circles',
    description: 'Founders connecting at TEN meetups, peer reviews, and celebration moments.',
    items: [
      { image: '/assets/images/1519389950473-47ba0277781c.jpg', caption: 'Collaboration session', alt: 'Collaboration session' },
      { image: '/assets/images/1520607162513-77705c0f0d4a.jpg', caption: 'Founder circles', alt: 'Founder circles' },
      { image: '/assets/images/1542744173-05336fcc7ad4.jpg', caption: 'Team engagement', alt: 'Team engagement' },
      { image: '/assets/images/1507003211169-0a1dd7228f2d.jpg', caption: 'Network event', alt: 'Network event' },
    ],
  },
  {
    title: 'Programs in action',
    caption: 'Weekly · Monthly · Quarterly',
    description: 'Hands-on learning from ideation through pitch day — mentorship, workshops, and accountability.',
    items: [
      { image: '/assets/images/1454165804606-c3d57bc86b40.jpg', caption: 'Weekly foundation', alt: 'Weekly foundation' },
      { image: '/assets/images/1552664730-d307ca884978.jpg', caption: 'Mentor workshops', alt: 'Mentor workshops' },
      { image: '/assets/images/1542744173-8e7e53415bb0.jpg', caption: 'Pitch & progress', alt: 'Pitch & progress' },
      { image: '/assets/images/1498050108023-c5249f4df085.jpg', caption: 'Learning in action', alt: 'Learning in action' },
    ],
  },
  {
    title: 'Leadership & growth',
    caption: 'Spotlight',
    description: 'Moments that reflect resilience, mentorship, and the spirit of FIRE across the network.',
    items: [
      { image: '/assets/images/1573496774426-fe3db3dd1731.jpg', caption: 'Leadership moments', alt: 'Leadership moments' },
      { image: '/assets/images/1560250097-0b93528c311a.jpg', caption: 'Mentorship', alt: 'Mentorship' },
      { image: '/assets/images/1517048676732-d65bc937f952.jpg', caption: 'Workshops', alt: 'Workshops' },
      { image: '/assets/images/1523240795612-9a054b0db644.jpg', caption: 'Network growth', alt: 'Network growth' },
    ],
  },
]

export function registerGalleryEnsureRoute(app, { supabase, verifyUser, requireStaff }) {
  app.post('/api/admin/gallery/ensure', verifyUser, requireStaff, async (req, res) => {
    try {
      let { data: page, error: pageErr } = await supabase.from('pages').select('*').eq('slug', 'gallery').maybeSingle()
      if (pageErr) throw pageErr
      if (!page) {
        const ins = await supabase
          .from('pages')
          .insert({
            slug: 'gallery',
            title: 'Gallery',
            status: 'published',
            sort_order: 35,
            seo_title: 'Gallery',
            seo_description: 'Photos and videos from The Ember Network',
            layout_mode: 'blocks_only',
          })
          .select('*')
          .single()
        if (ins.error) throw ins.error
        page = ins.data
      } else {
        await supabase.from('pages').update({ status: 'published', layout_mode: 'blocks_only' }).eq('id', page.id)
      }

      const { data: existing } = await supabase.from('page_blocks').select('block_type').eq('page_id', page.id)
      const types = new Set((existing || []).map((b) => b.block_type))
      const seeds = []
      if (!types.has('hero')) {
        seeds.push({
          page_id: page.id,
          block_type: 'hero',
          sort_order: 0,
          enabled: true,
          updated_by: req.user.id,
          content: {
            variant: 'inner',
            badge: 'Gallery',
            headline_before: 'Moments from the network',
            description:
              'Watch program highlights and browse photo albums from events, mentorship sessions, and community gatherings.',
            background_image: '/assets/images/1531123897727-8f129e1688ce.jpg',
          },
        })
      }
      if (!types.has('video_gallery')) {
        seeds.push({
          page_id: page.id,
          block_type: 'video_gallery',
          sort_order: 1,
          enabled: true,
          updated_by: req.user.id,
          content: {
            eyebrow: 'Videos',
            title: 'Program highlights',
            subtitle: 'Add YouTube/Vimeo links or upload videos via the gallery manager.',
            items: [],
          },
        })
      }
      if (!types.has('gallery')) {
        seeds.push({
          page_id: page.id,
          block_type: 'gallery',
          sort_order: 2,
          enabled: true,
          updated_by: req.user.id,
          content: {
            eyebrow: 'Photos',
            title: 'Photo albums',
            subtitle: 'Browse collections by theme — each album has a caption, description, and photo captions.',
            albums: DEFAULT_GALLERY_ALBUMS,
          },
        })
      } else {
        const { data: galleryBlocks } = await supabase
          .from('page_blocks')
          .select('id, content')
          .eq('page_id', page.id)
          .eq('block_type', 'gallery')
        const empty = (galleryBlocks || []).find((b) => {
          const albums = b.content?.albums || []
          return !albums.some((a) => (a.items || []).some((it) => it.image || it.src))
        })
        if (empty) {
          await supabase
            .from('page_blocks')
            .update({
              content: {
                eyebrow: 'Photos',
                title: 'Photo albums',
                subtitle: 'Browse collections by theme — each album has a caption, description, and photo captions.',
                albums: DEFAULT_GALLERY_ALBUMS,
              },
              updated_by: req.user.id,
            })
            .eq('id', empty.id)
        }
      }
      if (seeds.length) {
        const { error: seedErr } = await supabase.from('page_blocks').insert(seeds)
        if (seedErr) throw seedErr
      }

      const { data: blocks, error: bErr } = await supabase
        .from('page_blocks')
        .select('*')
        .eq('page_id', page.id)
        .order('sort_order')
      if (bErr) throw bErr
      res.json({ page, blocks: blocks || [] })
    } catch (err) {
      res.status(400).json({ error: err?.message || 'Gallery ensure error' })
    }
  })
}
