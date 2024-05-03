<?php

namespace webDevTools;

use Exception;

class CSV {
	private $filename;
	private $delimiter = ',';
	public $file = 'data.csv';
	public $file_handle = null;
	public $new_file = false;
	public $comma_replacer = '|';

	public function __construct( $file ) {
		$this->file = $file;
	}



	/**
	 * Reads the CSV file and returns the data as an array.
	 *
	 * @return array The CSV data.
	 */
	public function read_all( $file, $offset = 1, $limit = '', $only_row_num = '' ) {
		$data = array();
		$row_num = 0;
		$row_num_limit = 0;
		if ( ( $handle = fopen( $file, 'r' ) ) !== false ) {
			while ( ( $row = fgetcsv( $handle, 0, $this->delimiter ) ) !== false ) {
				$row_num++;


				if ( ! empty( $offset ) && $row_num <= $offset ) {
					continue;
				}
				if ( ! empty( $limit ) && $row_num_limit > $limit ) {
					break;
				}
				if ( ! empty( $only_row_num ) && $row_num != $only_row_num ) {
					continue;
				}
				$row_num_limit++;
				$data[] = $row;
			}
			fclose( $handle );
		}
		return $data;
	}

	/**
		   * Reads a CSV file and maps the data based on the provided mapper.
		   * Allows for offset and limit to control the data read.
		   *
		   * @param string $csv_file The path to the CSV file.
		   * @param array $mapper An associative array to map the CSV data. $mapper_example = [
						  'KEY_NAME' => 0,]
		   * @param int $offset The number of rows to skip from the beginning.
		   * @param int $limit The maximum number of rows to read.
		   * @param int $only_row_num If set, only this row number will be read.
		   * @throws Exception If the file cannot be opened.
		   * @return array The mapped CSV data.
		   */
	public function read( $file, $mapper = array(), $offset = 1, $limit = '', $only_row_num = '' ) {


		$this->file_handle = $this->get_file_handle( $file, 'read' );

		$row_num = 0;
		$row_num_limit = 0;
		while ( $row = fgetcsv( $this->file_handle ) ) {
			$row_num++;
			if ( empty( $mapper ) && $row_num == 1 ) {
				$mapper = array_flip( $row );
				continue;
			}

			if ( ! empty( $offset ) && $row_num <= $offset ) {
				continue;
			}
			if ( ! empty( $limit ) && $row_num_limit > $limit ) {
				break;
			}
			if ( ! empty( $only_row_num ) && $row_num != $only_row_num ) {
				continue;
			}
			$row_num_limit++;
			$r = array();
			foreach ( $mapper as $mk => $mv ) {
				if ( isset( $row[ $mv ] ) ) {
					//$r[ $mk ] = utf8_encode( $row[ $mv ] );
					$r[ $mk ] = $row[ $mv ];
				}
			}
			$data[] = $r;
		}
		fclose( $this->file_handle );
		return $data;
	}

	/**
	 *  Write to CSV
	 *
	 * @param mixed $data row-col format array
	 * @param mixed $file_name
	 * @param mixed $mapper
	 * @param mixed $formatter a Closure functions to format values
	 *
	 * @return $this
	 */
	public function write( $file, $data, $mapper = array(), $formatter = array() ) {

		if ( empty( $mapper ) ) {
			$mapper = array_keys( (array) $data[0] );
		}
		$this->file_handle = $this->get_file_handle( $file, 'write' );

		if ( $this->new_file ) {
			$mapper_head = array_values( $mapper );
			fputcsv( $this->file_handle, $mapper_head );
		}

		$mapper_keys = array_flip( $mapper );
		foreach ( $data as $k => $v ) {
			$row = array();
			$v = (array) $v;
			foreach ( $mapper_keys as $key => $index ) {
				$csv_val = '';
				if ( isset( $v[ $key ] ) ) {
					if ( isset( $formatter[ $key ] ) ) {
						if ( $formatter[ $key ] instanceof Closure ) {
							$csv_val = $formatter[ $key ]( $v );
						}
						$csv_val = $formatter[ $key ]( $v );
					} else {
						$csv_val = $v[ $key ];
					}

					$csv_val = str_replace( ',', $this->comma_replacer, $csv_val );
				} elseif ( isset( $formatter[ $key ] ) ) {
					if ( $formatter[ $key ] instanceof Closure ) {
						$csv_val = $formatter[ $key ]( $v );
					}
				}
				$row[ $index ] = $csv_val;
			}
			fputcsv( $this->file_handle, $row );
		}
		return $this;
	}

	/**
	 * Sends the CSV file to the client for download.
	 *
	 * @return void
	 */
	public function download() {
		header( 'Content-Type: text/csv; charset=utf-8' );
		header( "Content-Disposition: attachment; filename={$this->file}" );
		echo file_get_contents( $this->file );
	}

	private function get_file_handle( $file, $mode = 'read' ) {
		if ( $this->file_handle ) {
			return $this->file_handle;
		}
		if ( $mode == 'read' ) {
			$this->file_handle = fopen( $file, 'r+' );
		} else {
			if ( ! file_exists( $file ) ) {
				$this->new_file = true;
				$this->file_handle = fopen( $file, 'w' );
			} else {
				$this->file_handle = fopen( $file, 'a+' );
			}
		}

		if ( ! $this->file_handle ) {
			throw new Exception( 'Could not open the file - ' . $file );
		}
		return $this->file_handle;
	}
}
