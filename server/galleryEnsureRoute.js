/**
 * Ensures gallery CMS page + hero / video_gallery / gallery blocks exist.
 * Registered from server/index.js so the route is always available on API startup.
 */

const DEFAULT_GALLERY_ALBUMS = []

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
            background_image: '',
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
