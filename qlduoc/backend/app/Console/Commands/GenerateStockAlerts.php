<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\StockAlertService;

class GenerateStockAlerts extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'stock:generate-alerts';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Generate stock alerts for low stock, near expiry, and expired items';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🔍 Generating stock alerts...');
        
        $service = new StockAlertService();
        $results = $service->generateAlerts();
        $service->autoResolveAlerts();

        $this->info('✅ Stock alerts generated successfully!');
        $this->table(
            ['Alert Type', 'Count'],
            [
                ['Near Expiry', $results['expiry_alerts']],
                ['Expired', $results['expired_alerts']],
                ['Low Stock', $results['low_stock_alerts']],
                ['Over Stock', $results['over_stock_alerts']],
            ]
        );

        return Command::SUCCESS;
    }
}
