# webDevTools

## Overview

Various PHP, JS, SQL, CSS and HTML Web Development tools

## Requirements

* PHP version 5.4 or newer

## Installation

Install the package using Composer:
composer require devpradeep/web_dev_tools

# CSV Reader

This is a simple CSV reader that can read a CSV file and return the data as an array. It also supports mapping the data based on a provided mapper, and allows for offset and limit to control the data read.

## Usage

```php
$file_input = 'test.csv';
$csv = new CSV($file_input);
try {
    // Example 1: Read all records
    $data = $csv->read($file_input, []); 
    print('<pre>'.print_r($data,true).'</pre>');

    // Example 2: Read only 10 records
    $data = $csv->read($file_input, [], 1, 10); 
    print('<pre>'.print_r($data,true).'</pre>');

    // Example 3: Read only row number 10
    $data = $csv->read($file_input, [], '', '',10); 
    print('<pre>'.print_r($data,true).'</pre>');

    // Example 4: Read with mapper
    $map['id'] = 2;
    $map['desc'] = 12;
    $data = $csv->read($file_input, $map, '', '',10); 
    print('<pre>'.print_r($data,true).'</pre>');

    $file_output = 'log.csv';
    $csv_write = new CSV($file_output);

    $data[] = ['id' => 1, 'desc' => 'test1,455,5567 , 9900', 'link' => 'http://test1.com'];
	$data[] = ['id' => 2, 'desc' => 'test2,569697,454', 'link' => 'http://test1.com'];
	//Simple write
	//$file = $csv_write->write($file_output, $data);
	$map = [];
	$map['ID'] = 'id';
	$map['Link'] = 'link';
	$map['Description'] = 'desc';
	
	$formatter = array(
		'link' => function ( $v ) {
			$m = $v['link'] . '/test';
			return $m;
		},
	);
	//$file = $csv_write->write($file_output, $data, $map, $formatter)->file;
	$csv_write->write($file_output, $data, $map, $formatter)->download();

} catch (Exception $e) {
    echo "Error: " . $e->getMessage() . "\n";
}