import { NextResponse } from 'next/server';
import {
  getSources,
  addSource,
  toggleSourceStatus,
  deleteSource,
  validateFeedUrl,
  fetchAllActiveArticles,
} from '../../../../lib/services/newsSourceStore';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sources = await getSources();
    return NextResponse.json({
      success: true,
      sources,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action } = body;

    // 1. Live Validation of Feed URL
    if (action === 'validate') {
      const { url } = body;
      if (!url) {
        return NextResponse.json({ success: false, error: 'URL is required.' }, { status: 400 });
      }
      const result = await validateFeedUrl(url);
      return NextResponse.json({ success: result.valid, ...result });
    }

    // 2. Add New Source & Ingest Immediately
    if (action === 'add') {
      const { name, url, category, type, trustScore, collectionFrequency } = body;
      if (!name || !url) {
        return NextResponse.json(
          { success: false, error: 'Source name and URL are required.' },
          { status: 400 }
        );
      }

      const res = await addSource({
        name,
        url,
        category: category || 'Tech News',
        type: type || 'RSS',
        trustScore: Number(trustScore) || 9,
        collectionFrequency: collectionFrequency || '15 minutes',
      });

      if (!res.success) {
        return NextResponse.json({ success: false, error: res.error }, { status: 400 });
      }

      // Trigger immediate live ingestion in the background
      fetchAllActiveArticles().catch((e) => console.error('[Live Ingestion Error]:', e));

      return NextResponse.json({
        success: true,
        source: res.source,
        message: `Successfully connected ${res.source?.name}. Live real-time updates activated.`,
      });
    }

    // 3. Force Immediate Ingestion Across All Sources
    if (action === 'sync') {
      const { articles, sourcesTelemetry } = await fetchAllActiveArticles();
      const sources = await getSources();

      return NextResponse.json({
        success: true,
        articlesCount: articles.length,
        sourcesCount: sources.length,
        telemetry: sourcesTelemetry,
        message: `Ingestion completed: ${articles.length} live articles processed across ${sources.length} sources.`,
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || 'Operation failed' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Source ID is required.' }, { status: 400 });
    }

    const res = await toggleSourceStatus(id);
    return NextResponse.json(res);
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Source ID is required.' }, { status: 400 });
    }

    const ok = await deleteSource(id);
    return NextResponse.json({ success: ok });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
