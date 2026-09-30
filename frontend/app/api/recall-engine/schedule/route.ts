import { NextResponse } from 'next/server';
import { recallDatabase } from '@/app/api/db';

export async function POST(request: Request) {
    try {
        let body;
        try {
            body = await request.json();
        } catch {
            return NextResponse.json(
                { success: false, error: 'Invalid JSON payload provided.' },
                { status: 400 }
            );
        }

        const record = {
            id: `recall_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            ...body,
            scheduledAt: new Date().toISOString()
        };

        recallDatabase.push(record);

        console.log(`[Recall Engine] Schedule created successfully.`);

        return NextResponse.json(
            {
                success: true,
                message: 'Recall schedule successfully created!',
                data: record
            },
            { status: 200 }
        );

    } catch (error) {
        console.error('[Recall Engine Critical Error]:', error);
        
        return NextResponse.json(
            { 
                success: false, 
                error: 'Failed to schedule recall. Please try again later.' 
            },
            { status: 500 }
        );
    }
}